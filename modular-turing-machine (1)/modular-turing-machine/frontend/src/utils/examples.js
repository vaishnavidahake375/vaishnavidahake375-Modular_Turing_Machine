/** Ready-made modular machines. T(state, read, write, move, next, call?) builds a transition.
 *  For a CALL transition, `next` is the RETURN state in the caller. */
const T = (state, read, write, move, next, call) => (call ? { state, read, write, move, next, call } : { state, read, write, move, next });

const mod = (id, name, description, entryState, exitState, transitions, extra = {}) => {
  const states = [...new Set(transitions.flatMap((t) => [t.state, t.call ? t.next : null].filter(Boolean)).concat(entryState, exitState || []))];
  return { id, name, description, entryState, exitState: exitState || null, states, transitions,
    inputRequirement: extra.input || 'Head on the relevant cell.', output: extra.output || 'Head positioned for the caller.', status: 'ready' };
};

/** ACCEPT / REJECT never return: they move to the halting state. */
const ACCEPT = mod('accept', 'ACCEPT', 'Halts in the accept state.', 'a0', null, [T('a0', '*', '*', 'S', 'q_accept')], { output: 'Machine accepts.' });
const REJECT = mod('reject', 'REJECT', 'Halts in the reject state.', 'r0', null, [T('r0', '*', '*', 'S', 'q_reject')], { output: 'Machine rejects.' });

const build = (o) => {
  const states = [...new Set(o.modules.flatMap((m) => m.states).concat('q_accept', 'q_reject'))];
  return { mainModule: 'MAIN', startState: o.modules[0].entryState, acceptState: 'q_accept', rejectState: 'q_reject', blank: 'B', ...o, states };
};

/* 1. Binary string ending with 1 */
const ex1 = build({
  id: 'ends-with-1', name: 'Binary ends with 1',
  description: 'MAIN calls FIND_END to reach the last symbol, then ACCEPT or REJECT.',
  inputAlphabet: ['0', '1'], tapeAlphabet: ['0', '1', 'B'],
  samples: [['101', 'ACCEPT'], ['100', 'REJECT']],
  modules: [
    mod('main', 'MAIN', 'Controls the computation.', 'm0', null, [
      T('m0', '0', '0', 'S', 'm1', 'FIND_END'), T('m0', '1', '1', 'S', 'm1', 'FIND_END'),
      T('m1', '1', '1', 'S', 'm1', 'ACCEPT'), T('m1', '0', '0', 'S', 'm1', 'REJECT'),
    ]),
    mod('find_end', 'FIND_END', 'Moves right to the end of the input, then steps back onto the last symbol.', 'fe0', 'fe1', [
      T('fe0', '0', '0', 'R', 'fe0'), T('fe0', '1', '1', 'R', 'fe0'), T('fe0', 'B', 'B', 'L', 'fe1'),
    ], { input: 'Head anywhere on the input.', output: 'Head on the last input symbol.' }),
    ACCEPT, REJECT,
  ],
});

/* 2. Unary increment */
const ex2 = build({
  id: 'unary-increment', name: 'Unary increment',
  description: 'GOTO_BLANK runs past the 1s; MAIN writes one more 1. 111 becomes 1111.',
  inputAlphabet: ['1'], tapeAlphabet: ['1', 'B'],
  samples: [['111', 'ACCEPT (tape 1111)'], ['1', 'ACCEPT (tape 11)']],
  modules: [
    mod('main', 'MAIN', 'Calls GOTO_BLANK then appends a 1.', 'm0', null, [
      T('m0', '1', '1', 'S', 'm1', 'GOTO_BLANK'), T('m1', 'B', '1', 'S', 'q_accept'),
    ]),
    mod('goto_blank', 'GOTO_BLANK', 'Moves right to the first blank cell.', 'g0', 'g1', [
      T('g0', '1', '1', 'R', 'g0'), T('g0', 'B', 'B', 'S', 'g1'),
    ], { output: 'Head on the first blank after the 1s.' }),
  ],
});

/* 3. Binary string containing a 1 */
const ex3 = build({
  id: 'contains-1', name: 'Binary contains 1',
  description: 'SCAN_FOR_ONE walks right over 0s; MAIN decides what it found.',
  inputAlphabet: ['0', '1'], tapeAlphabet: ['0', '1', 'B'],
  samples: [['00100', 'ACCEPT'], ['00000', 'REJECT']],
  modules: [
    mod('main', 'MAIN', 'Calls SCAN_FOR_ONE then decides.', 'm0', null, [
      T('m0', '0', '0', 'S', 'm1', 'SCAN_FOR_ONE'), T('m0', '1', '1', 'S', 'm1', 'SCAN_FOR_ONE'),
      T('m1', '1', '1', 'S', 'm1', 'ACCEPT'), T('m1', 'B', 'B', 'S', 'm1', 'REJECT'),
    ]),
    mod('scan', 'SCAN_FOR_ONE', 'Moves right until a 1 or a blank is under the head.', 's0', 's1', [
      T('s0', '0', '0', 'R', 's0'), T('s0', '1', '1', 'S', 's1'), T('s0', 'B', 'B', 'S', 's1'),
    ]),
    ACCEPT, REJECT,
  ],
});

/* 4. Palindrome over {0,1}: erase first symbol, compare with last, repeat */
const ex4 = build({
  id: 'palindrome', name: 'Binary palindrome checker',
  description: 'Erase the first symbol, FIND_RIGHT_END, compare with the last, erase it, FIND_LEFT_END, repeat.',
  inputAlphabet: ['0', '1'], tapeAlphabet: ['0', '1', 'B'],
  samples: [['101', 'ACCEPT'], ['100', 'REJECT'], ['0110', 'ACCEPT']],
  modules: [
    mod('main', 'MAIN', 'Drives the compare-and-erase loop.', 'p0', null, [
      T('p0', 'B', 'B', 'S', 'p0', 'ACCEPT'),
      T('p0', '0', 'B', 'R', 'p0_0'), T('p0', '1', 'B', 'R', 'p0_1'),
      T('p0_0', 'B', 'B', 'S', 'p0_0', 'ACCEPT'),
      T('p0_0', '0', '0', 'S', 'p1_0', 'FIND_RIGHT_END'), T('p0_0', '1', '1', 'S', 'p1_0', 'FIND_RIGHT_END'),
      T('p0_1', 'B', 'B', 'S', 'p0_1', 'ACCEPT'),
      T('p0_1', '0', '0', 'S', 'p1_1', 'FIND_RIGHT_END'), T('p0_1', '1', '1', 'S', 'p1_1', 'FIND_RIGHT_END'),
      T('p1_0', '0', 'B', 'L', 'p0', 'FIND_LEFT_END'), T('p1_0', '1', '1', 'S', 'p1_0', 'REJECT'),
      T('p1_1', '1', 'B', 'L', 'p0', 'FIND_LEFT_END'), T('p1_1', '0', '0', 'S', 'p1_1', 'REJECT'),
    ]),
    mod('fre', 'FIND_RIGHT_END', 'Moves right past the remaining input, then back onto its last symbol.', 'r0', 'r1', [
      T('r0', '0', '0', 'R', 'r0'), T('r0', '1', '1', 'R', 'r0'), T('r0', 'B', 'B', 'L', 'r1'),
    ]),
    mod('fle', 'FIND_LEFT_END', 'Moves left to the erased boundary, then right onto the first remaining symbol.', 'l0', 'l1', [
      T('l0', '0', '0', 'L', 'l0'), T('l0', '1', '1', 'L', 'l0'), T('l0', 'B', 'B', 'R', 'l1'),
    ]),
    ACCEPT, REJECT,
  ],
});

/* 5. a^n b^n */
const ex5 = build({
  id: 'anbn', name: 'a^n b^n',
  description: 'Mark an a (X), FIND_B, mark a b (Y), RETURN_LEFT, repeat; SKIP_Y verifies nothing is left over.',
  inputAlphabet: ['a', 'b'], tapeAlphabet: ['a', 'b', 'X', 'Y', 'B'],
  samples: [['aabb', 'ACCEPT'], ['aaabbb', 'ACCEPT'], ['aab', 'REJECT']],
  modules: [
    mod('main', 'MAIN', 'Match one a with one b per round.', 's0', null, [
      T('s0', 'a', 'X', 'R', 's1', 'FIND_B'),
      T('s0', 'Y', 'Y', 'R', 's2', 'SKIP_Y'),
      T('s0', 'b', 'b', 'S', 's0', 'REJECT'), T('s0', 'B', 'B', 'S', 's0', 'REJECT'),
      T('s1', 'b', 'Y', 'L', 's0', 'RETURN_LEFT'),
      T('s1', 'B', 'B', 'S', 's1', 'REJECT'),
      T('s2', 'B', 'B', 'S', 'q_accept'),
      T('s2', '*', '*', 'S', 's2', 'REJECT'),
    ]),
    mod('find_b', 'FIND_B', 'Skips a and Y to the first unmatched b.', 'fb0', 'fb1', [
      T('fb0', 'a', 'a', 'R', 'fb0'), T('fb0', 'Y', 'Y', 'R', 'fb0'),
      T('fb0', 'b', 'b', 'S', 'fb1'), T('fb0', 'B', 'B', 'S', 'fb1'),
    ]),
    mod('return_left', 'RETURN_LEFT', 'Moves left to the last X, then one cell right.', 'rl0', 'rl1', [
      T('rl0', 'a', 'a', 'L', 'rl0'), T('rl0', 'Y', 'Y', 'L', 'rl0'), T('rl0', 'X', 'X', 'R', 'rl1'),
    ]),
    mod('skip_y', 'SKIP_Y', 'Skips Y marks; stops at the first other symbol.', 'ky0', 'ky1', [
      T('ky0', 'Y', 'Y', 'R', 'ky0'), T('ky0', 'B', 'B', 'S', 'ky1'),
      T('ky0', 'a', 'a', 'S', 'ky1'), T('ky0', 'b', 'b', 'S', 'ky1'),
    ]),
    REJECT,
  ],
});

export const EXAMPLES = [ex1, ex2, ex3, ex4, ex5];
export const getExample = (id) => EXAMPLES.find((e) => e.id === id);
