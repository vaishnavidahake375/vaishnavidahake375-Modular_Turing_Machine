import { useState } from 'react';
import { getExample } from './examples.js';

const KEY = 'tm:working';

/** Recompute derived fields so the machine is always internally consistent. */
export const normalize = (m) => {
  const main = (m.modules || []).find((x) => x.name === 'MAIN');
  return {
    ...m, id: 'custom', mainModule: 'MAIN', blank: 'B', samples: m.samples || [],
    startState: main?.entryState ?? m.startState,
    states: [...new Set([...(m.modules || []).flatMap((x) => x.states || []), m.acceptState, m.rejectState].filter(Boolean))],
  };
};

export function loadWorking() {
  try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch { /* ignore */ }
  return normalize(structuredClone({ ...getExample('ends-with-1'), name: 'My machine' }));
}
export function saveWorking(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ } }

/** The machine being edited in Builder / Module Editor and run via ?example=custom. */
export function useWorkingMachine() {
  const [machine, setMachine] = useState(loadWorking);
  const update = (next) => {
    const n = normalize(typeof next === 'function' ? next(machine) : next);
    setMachine(n); saveWorking(n);
  };
  return [machine, update];
}
