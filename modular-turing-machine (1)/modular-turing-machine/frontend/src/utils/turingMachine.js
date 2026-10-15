/**
 * MODULAR TURING MACHINE ENGINE
 * ------------------------------------------------------------------
 * A real Turing Machine interpreter extended with SUBROUTINES.
 *
 * TAPE      : an array of symbols. Cells beyond either end are blank ("B");
 *             the array grows automatically when the head moves off it.
 * TRANSITION: { state, read, write, move, next, call? }
 *             - read "*"  matches any symbol (only if no exact match exists)
 *             - write "*" keeps the symbol that was read
 *             - move is L, R or S
 * MODULE    : a named group of states + transitions with ONE entry state
 *             and ONE exit state. Every machine has a MAIN module.
 * CALL      : a transition with `call: "MODULE_NAME"`. It performs its
 *             normal read/write/move, then PUSHES a frame
 *             { module: caller, returnState: t.next } on the call stack and
 *             jumps to the callee's entry state.
 * RETURN    : when the current state equals the current module's exit state
 *             and the stack is not empty, the top frame is POPPED and control
 *             goes back to frame.returnState inside the caller module.
 * HISTORY   : each step (and each CALL/RETURN control event) appends a row.
 * HALTING   : reaching acceptState / rejectState (from any module) stops the
 *             machine. A missing transition rejects with an explanatory message.
 */
export const BLANK = 'B';
export const WILDCARD = '*';
export const MOVES = ['L', 'R', 'S'];
export const MAX_STEPS_DEFAULT = 1000;
export const MAX_STACK_DEPTH = 100;
export const LOOP_MESSAGE =
  'Execution stopped because the machine may be entering an infinite loop.';

export const getModule = (machine, name) =>
  (machine.modules || []).find((m) => m.name === name);

/** Exact match first, then wildcard. */
export function findTransition(module, state, symbol) {
  const ts = module.transitions || [];
  return (
    ts.find((t) => t.state === state && t.read === symbol) ||
    ts.find((t) => t.state === state && t.read === WILDCARD)
  );
}

/** Returns an array of human-readable problems (empty = machine is valid). */
export function validateMachine(m) {
  const errors = [];
  if (!m || typeof m !== 'object') return ['Machine configuration is incomplete.'];
  const states = new Set(m.states || []);
  const tape = new Set(m.tapeAlphabet || []);
  const input = m.inputAlphabet || [];
  const mods = m.modules || [];

  if (!m.startState) errors.push('Missing start state.');
  else if (!states.has(m.startState)) errors.push(`Start state ${m.startState} is not in the state list.`);
  if (!m.acceptState) errors.push('Missing accept state.');
  else if (!states.has(m.acceptState)) errors.push(`Accept state ${m.acceptState} is not in the state list.`);
  if (!m.rejectState) errors.push('Missing reject state.');
  else if (!states.has(m.rejectState)) errors.push(`Reject state ${m.rejectState} is not in the state list.`);
  if (m.acceptState && m.acceptState === m.rejectState) errors.push('Accept and reject states must differ.');
  if (!input.length) errors.push('Input alphabet is empty.');
  if (!tape.has(BLANK)) errors.push(`Tape alphabet must contain the blank symbol ${BLANK}.`);
  if (input.includes(BLANK)) errors.push('Input alphabet must not contain the blank symbol.');
  input.forEach((s) => { if (!tape.has(s)) errors.push(`Input symbol ${s} is missing from the tape alphabet.`); });

  const mainName = m.mainModule || 'MAIN';
  const main = mods.find((x) => x.name === mainName);
  if (!main) errors.push('Machine configuration is incomplete: MAIN module is missing.');
  else if (main.entryState !== m.startState) errors.push('MAIN module entry state must equal the machine start state.');

  const names = new Set();
  mods.forEach((mod) => {
    const tag = `Module ${mod.name || '(unnamed)'}`;
    if (!mod.name) errors.push('A module has no name.');
    if (names.has(mod.name)) errors.push(`${tag}: duplicate module name.`);
    names.add(mod.name);
    const ms = new Set(mod.states || []);
    if (!mod.entryState) errors.push(`${tag}: Module entry state is missing.`);
    else if (!ms.has(mod.entryState)) errors.push(`${tag}: entry state ${mod.entryState} is not in its state list.`);
    if (mod.name !== mainName && mod.exitState) {
      if (!ms.has(mod.exitState)) errors.push(`${tag}: exit state ${mod.exitState} is not in its state list.`);
    }
    const seen = new Set();
    (mod.transitions || []).forEach((t, i) => {
      const at = `${tag}, transition #${i + 1} (${t.state},${t.read})`;
      const key = `${t.state}|${t.read}`;
      if (seen.has(key)) errors.push(`${at}: duplicate transition.`);
      seen.add(key);
      if (!ms.has(t.state)) errors.push(`${at}: state ${t.state} is not in the module's states.`);
      if (t.read !== WILDCARD && !tape.has(t.read)) errors.push(`${at}: read symbol is not in the tape alphabet.`);
      if (t.write !== WILDCARD && !tape.has(t.write)) errors.push(`${at}: write symbol is not in the tape alphabet.`);
      if (!MOVES.includes(t.move)) errors.push(`${at}: invalid move "${t.move}" (use L, R or S).`);
      if (t.call) {
        if (!mods.some((x) => x.name === t.call)) errors.push(`${at}: calls unknown module ${t.call}.`);
        else if (!mods.find((x) => x.name === t.call).exitState) {
          // A callee without an exit state never returns (e.g. ACCEPT / REJECT) - allowed.
        }
        if (!ms.has(t.next)) errors.push(`${at}: return state ${t.next} is not in the module's states.`);
      } else if (!ms.has(t.next) && t.next !== m.acceptState && t.next !== m.rejectState) {
        errors.push(`${at}: undefined next state ${t.next}.`);
      }
    });
  });
  return errors;
}

export function validateInput(machine, input) {
  if (typeof input !== 'string' || input.length === 0) {
    if (machine.allowEmptyInput) return [];
    return ['Input is empty. Enter at least one symbol.'];
  }
  const bad = [...new Set(input.split('').filter((c) => !(machine.inputAlphabet || []).includes(c)))];
  return bad.length ? [`Input contains symbols not included in the input alphabet: ${bad.join(', ')}`] : [];
}

/** Build the initial configuration (tape, head=0, start state, empty stack). */
export function createConfig(machine, input, maxSteps = MAX_STEPS_DEFAULT) {
  const main = getModule(machine, machine.mainModule || 'MAIN');
  return {
    tape: input.length ? input.split('') : [BLANK],
    head: 0,
    state: main.entryState,
    module: main.name,
    stack: [],
    steps: 0,
    maxSteps,
    status: 'running', // running | accepted | rejected | limit | error
    message: '',
    history: [],
    modulesUsed: [main.name],
    moduleTrail: [main.name],
    maxDepth: 0,
    lastTransition: null,
  };
}

/** Handle halting states and automatic RETURNs (mutates c). */
function settle(machine, c) {
  for (let guard = 0; guard < MAX_STACK_DEPTH + 5; guard++) {
    if (c.state === machine.acceptState) { c.status = 'accepted'; c.message = 'Input accepted.'; return; }
    if (c.state === machine.rejectState) { c.status = 'rejected'; c.message = 'Input rejected.'; return; }
    const mod = getModule(machine, c.module);
    if (c.stack.length && mod && c.state === mod.exitState) {
      const frame = c.stack.pop();
      c.history.push({
        step: c.steps, kind: 'RETURN', module: c.module, state: c.state,
        read: '-', write: '-', move: '-', next: frame.returnState,
        action: `Return from ${c.module} to ${frame.module} at state ${frame.returnState}.`,
        stackDepth: c.stack.length,
      });
      c.module = frame.module; c.state = frame.returnState;
      c.moduleTrail.push(c.module);
      continue;
    }
    return;
  }
}

const MOVE_WORD = { L: 'left', R: 'right', S: 'stay' };

/** Execute exactly ONE transition in place (plus any resulting returns). */
export function stepInPlace(machine, c) {
  if (c.status !== 'running') return c;
  settle(machine, c);
  if (c.status !== 'running') return c;
  if (c.steps >= c.maxSteps) { c.status = 'limit'; c.message = LOOP_MESSAGE; return c; }

  while (c.head >= c.tape.length) c.tape.push(BLANK);
  const symbol = c.tape[c.head];
  const mod = getModule(machine, c.module);
  const t = mod && findTransition(mod, c.state, symbol);
  if (!t) {
    c.status = 'rejected';
    c.message = `No transition found for state ${c.state} and symbol ${symbol}.`;
    return c;
  }

  const write = t.write === WILDCARD ? symbol : t.write;
  c.tape[c.head] = write;
  if (t.move === 'R') c.head++;
  else if (t.move === 'L') { c.head--; if (c.head < 0) { c.tape.unshift(BLANK); c.head = 0; } }
  while (c.head >= c.tape.length) c.tape.push(BLANK);

  const fromModule = c.module, fromState = c.state;
  let action = `In ${fromState} read ${symbol}, write ${write}, move ${MOVE_WORD[t.move]}`;
  let kind = 'STEP';
  if (t.call) {
    if (c.stack.length >= MAX_STACK_DEPTH) {
      c.status = 'error'; c.message = `Call stack overflow (more than ${MAX_STACK_DEPTH} nested calls).`; return c;
    }
    const callee = getModule(machine, t.call);
    c.stack.push({ module: c.module, returnState: t.next });
    c.maxDepth = Math.max(c.maxDepth, c.stack.length);
    c.module = callee.name; c.state = callee.entryState;
    if (!c.modulesUsed.includes(callee.name)) c.modulesUsed.push(callee.name);
    c.moduleTrail.push(callee.name);
    kind = 'CALL';
    action += `; CALL ${callee.name} (will return to ${t.next}).`;
  } else {
    c.state = t.next;
    action += `; go to ${t.next}.`;
  }
  c.steps++;
  c.lastTransition = { module: fromModule, state: fromState, read: t.read };
  c.history.push({
    step: c.steps, kind, module: fromModule, state: fromState, read: symbol, write,
    move: t.move, next: t.next, action, stackDepth: c.stack.length,
  });
  settle(machine, c);
  return c;
}

const cloneConfig = (c) => ({
  ...c, tape: [...c.tape], stack: c.stack.map((f) => ({ ...f })), history: [...c.history],
  modulesUsed: [...c.modulesUsed], moduleTrail: [...c.moduleTrail],
});

/** Immutable single step (safe for React state). */
export const step = (machine, config) => stepInPlace(machine, cloneConfig(config));

/**
 * "Run Subroutine": if inside a subroutine, run until it returns to its caller.
 * If in MAIN, run until the next CALL has completed and control is back in MAIN.
 */
export function runSubroutine(machine, config) {
  const c = cloneConfig(config);
  const target = c.stack.length > 0 ? c.stack.length - 1 : 0;
  let entered = c.stack.length > 0;
  while (c.status === 'running') {
    stepInPlace(machine, c);
    if (c.stack.length > 0) entered = true;
    if (entered && c.stack.length <= target) break;
  }
  return c;
}

export const runToEnd = (machine, config) => {
  const c = cloneConfig(config);
  while (c.status === 'running') stepInPlace(machine, c);
  return c;
};

export const trimTape = (tape) => tape.join('').replace(new RegExp(`^${BLANK}+|${BLANK}+$`, 'g'), '');

/** Summarise a finished configuration. */
export function summarize(config, input, executionTime = 0) {
  return {
    input, status: config.status, accepted: config.status === 'accepted',
    message: config.message, steps: config.steps, finalState: config.state,
    finalTape: trimTape(config.tape), modulesUsed: config.modulesUsed,
    moduleTrail: config.moduleTrail, maxStackDepth: config.maxDepth,
    executionTime, executionHistory: config.history,
  };
}

/** Validate then run a machine on an input from start to finish. */
export function run(machine, input, { maxSteps = MAX_STEPS_DEFAULT } = {}) {
  const errors = [...validateMachine(machine), ...validateInput(machine, input)];
  if (errors.length) {
    return { input, status: 'error', accepted: false, errors, message: errors[0], steps: 0,
      finalState: null, finalTape: '', modulesUsed: [], moduleTrail: [], maxStackDepth: 0,
      executionTime: 0, executionHistory: [] };
  }
  const t0 = performance.now();
  const c = createConfig(machine, input, maxSteps);
  while (c.status === 'running') stepInPlace(machine, c);
  return summarize(c, input, performance.now() - t0);
}
