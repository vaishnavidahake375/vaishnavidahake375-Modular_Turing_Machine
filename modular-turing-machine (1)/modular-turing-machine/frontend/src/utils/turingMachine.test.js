import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, createConfig, step, runSubroutine, validateMachine } from './turingMachine.js';
import { EXAMPLES, getExample } from './examples.js';

const go = (id, input, opts) => run(getExample(id), input, opts);

test('all example machines are valid', () => {
  EXAMPLES.forEach((m) => assert.deepEqual(validateMachine(m), [], m.name));
});
test('ends-with-1', () => {
  assert.equal(go('ends-with-1', '101').status, 'accepted');
  assert.equal(go('ends-with-1', '100').status, 'rejected');
});
test('unary increment writes an extra 1', () => {
  const r = go('unary-increment', '111');
  assert.equal(r.status, 'accepted'); assert.equal(r.finalTape, '1111');
});
test('contains-1', () => {
  assert.equal(go('contains-1', '00100').status, 'accepted');
  assert.equal(go('contains-1', '00000').status, 'rejected');
});
test('palindrome', () => {
  for (const s of ['1', '101', '0110', '11011']) assert.equal(go('palindrome', s).status, 'accepted', s);
  for (const s of ['100', '01', '0111']) assert.equal(go('palindrome', s).status, 'rejected', s);
});
test('a^n b^n', () => {
  for (const s of ['ab', 'aabb', 'aaabbb']) assert.equal(go('anbn', s).status, 'accepted', s);
  for (const s of ['aab', 'abb', 'ba', 'abab']) assert.equal(go('anbn', s).status, 'rejected', s);
});
test('empty and invalid input are reported, not executed', () => {
  assert.match(go('ends-with-1', '').message, /empty/i);
  assert.match(go('ends-with-1', '10x').message, /alphabet/i);
  assert.equal(go('ends-with-1', '10x').steps, 0);
});
test('modules are really used (call stack)', () => {
  const r = go('palindrome', '101');
  assert.ok(r.modulesUsed.includes('FIND_RIGHT_END') && r.modulesUsed.includes('FIND_LEFT_END'));
  assert.ok(r.executionHistory.some((h) => h.kind === 'CALL'));
  assert.ok(r.executionHistory.some((h) => h.kind === 'RETURN'));
});
test('call stack push/pop on manual stepping', () => {
  const m = getExample('ends-with-1');
  let c = step(m, createConfig(m, '101'));
  assert.deepEqual(c.stack, [{ module: 'MAIN', returnState: 'm1' }]);
  assert.equal(c.module, 'FIND_END');
  const done = runSubroutine(m, c);
  assert.equal(done.module, 'MAIN'); assert.equal(done.stack.length, 0); assert.equal(done.state, 'm1');
});
test('nested module calls', () => {
  const m = {
    states: ['a0', 'a1', 'b0', 'b1', 'b2', 'c0', 'c1', 'q_accept', 'q_reject'], inputAlphabet: ['1'], tapeAlphabet: ['1', 'B'],
    startState: 'a0', acceptState: 'q_accept', rejectState: 'q_reject',
    modules: [
      { name: 'MAIN', entryState: 'a0', states: ['a0', 'a1'], transitions: [
        { state: 'a0', read: '1', write: '1', move: 'S', next: 'a1', call: 'OUTER' },
        { state: 'a1', read: '1', write: '1', move: 'S', next: 'q_accept' }] },
      { name: 'OUTER', entryState: 'b0', exitState: 'b1', states: ['b0', 'b1', 'b2'], transitions: [
        { state: 'b0', read: '1', write: '1', move: 'S', next: 'b2', call: 'INNER' },
        { state: 'b2', read: '1', write: '1', move: 'S', next: 'b1' }] },
      { name: 'INNER', entryState: 'c0', exitState: 'c1', states: ['c0', 'c1'], transitions: [
        { state: 'c0', read: '1', write: '1', move: 'S', next: 'c1' }] },
    ],
  };
  const r = run(m, '1');
  assert.equal(r.status, 'accepted'); assert.equal(r.maxStackDepth, 2);
  assert.deepEqual(r.moduleTrail, ['MAIN', 'OUTER', 'INNER', 'OUTER', 'MAIN']);
});
test('missing transition rejects with a clear message', () => {
  const base = getExample('ends-with-1');
  const m = { ...base, modules: base.modules.map((x) => (x.name === 'MAIN' ? { ...x, transitions: x.transitions.slice(0, 1) } : x)) };
  const r = run(m, '1');
  assert.equal(r.status, 'rejected'); assert.match(r.message, /No transition found for state m0 and symbol 1/);
});
test('infinite loop is stopped at the step limit', () => {
  const m = { states: ['q0', 'q_accept', 'q_reject'], inputAlphabet: ['1'], tapeAlphabet: ['1', 'B'], startState: 'q0', acceptState: 'q_accept', rejectState: 'q_reject',
    modules: [{ name: 'MAIN', entryState: 'q0', states: ['q0'], transitions: [{ state: 'q0', read: '1', write: '1', move: 'S', next: 'q0' }] }] };
  const r = run(m, '1', { maxSteps: 1000 });
  assert.equal(r.status, 'limit'); assert.equal(r.steps, 1000); assert.match(r.message, /infinite loop/);
});
test('validation catches duplicates, bad moves and undefined states', () => {
  const m = structuredClone(getExample('ends-with-1'));
  m.modules[0].transitions.push({ state: 'm0', read: '0', write: '0', move: 'X', next: 'nowhere' });
  const e = validateMachine(m).join('\n');
  assert.match(e, /duplicate transition/); assert.match(e, /invalid move/); assert.match(e, /undefined next state/);
});
test('large input', () => {
  const bad = '1'.repeat(60) + '0' + '1'.repeat(61);
  assert.equal(run(getExample('palindrome'), bad, { maxSteps: 100000 }).status, 'rejected');
  const good = '10'.repeat(30) + '1' + '01'.repeat(30);
  assert.equal(run(getExample('palindrome'), good, { maxSteps: 100000 }).status, 'accepted');
});
