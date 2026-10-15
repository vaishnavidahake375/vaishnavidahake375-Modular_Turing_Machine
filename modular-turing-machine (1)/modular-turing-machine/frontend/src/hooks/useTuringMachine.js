import { useState, useEffect, useCallback, useMemo } from 'react';
import { createConfig, step, runSubroutine, runToEnd, run, validateMachine, validateInput } from '../utils/turingMachine.js';

/** All simulator state + actions. `config` is null until the machine is started. */
export function useTuringMachine(initialMachine) {
  const [machine, setMachine] = useState(initialMachine);
  const [input, setInputRaw] = useState(initialMachine.samples?.[0]?.[0] || '');
  const [config, setConfig] = useState(null);
  const [errors, setErrors] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [delay, setDelay] = useState(400);

  /** Validate the machine + input and build the initial configuration. */
  const init = useCallback(() => {
    const errs = [...validateMachine(machine), ...validateInput(machine, input)];
    setErrors(errs);
    if (errs.length) { setConfig(null); return null; }
    const c = createConfig(machine, input);
    setConfig(c);
    return c;
  }, [machine, input]);

  const setInput = (v) => { setInputRaw(v); setConfig(null); setPlaying(false); setErrors([]); };
  const load = (m, sample) => { setMachine(m); setInputRaw(sample ?? m.samples?.[0]?.[0] ?? ''); setConfig(null); setPlaying(false); setErrors([]); };

  const ensure = () => config || init();
  const stepOnce = () => { setPlaying(false); const c = ensure(); if (c) setConfig(step(machine, c)); };
  const start = () => { const c = ensure(); if (c) { setConfig(c); setPlaying(true); } };
  const pause = () => setPlaying(false);
  const reset = () => { setPlaying(false); init(); };
  const stop = () => { setPlaying(false); setConfig(null); };
  const runSub = () => { setPlaying(false); const c = ensure(); if (c) setConfig(runSubroutine(machine, c)); };
  const runAll = () => { setPlaying(false); const c = ensure(); if (c) setConfig(runToEnd(machine, c)); };
  const clearHistory = () => setConfig((c) => (c ? { ...c, history: [] } : c));

  // Auto-play: one step per tick until the machine halts.
  useEffect(() => {
    if (!playing) return undefined;
    if (!config || config.status !== 'running') { setPlaying(false); return undefined; }
    const id = setTimeout(() => setConfig((c) => step(machine, c)), delay);
    return () => clearTimeout(id);
  }, [playing, config, delay, machine]);

  const finished = config && config.status !== 'running';
  const result = useMemo(() => (finished ? run(machine, input, { maxSteps: config.maxSteps }) : null), [finished, machine, input, config?.maxSteps]);

  return { machine, input, setInput, config, errors, playing, delay, setDelay, load, stepOnce, start, pause, reset, stop, runSub, runAll, clearHistory, result };
}
