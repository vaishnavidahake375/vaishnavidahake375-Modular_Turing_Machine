import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlay, FiPause, FiSkipForward, FiRotateCcw, FiSquare, FiFastForward, FiLayers } from 'react-icons/fi';
import { useTuringMachine } from '../hooks/useTuringMachine.js';
import { EXAMPLES, getExample } from '../utils/examples.js';
import { getModule } from '../utils/turingMachine.js';
import { MOVE_LABELS } from '../utils/constants.js';
import { loadWorking } from '../utils/customMachine.js';
import { simulationService } from '../services/simulationService.js';
import Tape from '../components/Tape.jsx';
import ModuleFlow from '../components/ModuleFlow.jsx';
import TransitionTable from '../components/TransitionTable.jsx';
import ExecutionHistory from '../components/ExecutionHistory.jsx';
import ResultCard from '../components/ResultCard.jsx';

const Stat = ({ label, value }) => (
  <div className="rounded-md bg-navy-800 px-3 py-2"><div className="text-xs text-slate-500">{label}</div><div className="font-mono text-sm">{value ?? '-'}</div></div>
);

export default function Simulator() {
  const [params] = useSearchParams();
  const sim = useTuringMachine(params.get('example') === 'custom' ? loadWorking() : getExample(params.get('example')) || getExample('palindrome'));
  const { machine, config, input, playing } = sim;
  // Log every finished run to the API (silently skipped if the backend is offline).
  useEffect(() => { if (sim.result && sim.result.status !== 'error') simulationService.save({ machine: sim.machine, input: sim.input, maxSteps: sim.config.maxSteps }).catch(() => {}); }, [sim.result]); // eslint-disable-line react-hooks/exhaustive-deps
  const running = config?.status === 'running';
  const last = config ? [...config.history].reverse().find((h) => h.kind !== 'RETURN') : null;
  const caller = config?.stack.at(-1);
  const symbol = config ? config.tape[config.head] ?? 'B' : null;

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4">
      <section className="card flex flex-wrap items-end gap-3">
        <label className="text-sm">Machine
          <select className="mt-1 block rounded-md border border-slate-600 bg-navy-800 p-2" value={machine.id} onChange={(e) => sim.load(e.target.value === 'custom' ? loadWorking() : getExample(e.target.value))}>
            {EXAMPLES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            <option value="custom">My custom machine</option>
          </select>
        </label>
        <label className="text-sm">Input string
          <input className="mt-1 block rounded-md border border-slate-600 bg-navy-800 p-2 font-mono" value={input} onChange={(e) => sim.setInput(e.target.value)} placeholder={machine.inputAlphabet.join('')} />
        </label>
        <div className="flex flex-wrap gap-1 text-xs text-slate-400">Try:
          {machine.samples.map(([s, r]) => <button key={s} className="badge bg-slate-700 text-slate-200" onClick={() => sim.setInput(s)}>{s} → {r}</button>)}
        </div>
        <label className="ml-auto text-sm">Speed
          <input type="range" min="50" max="1000" step="50" value={1050 - sim.delay} onChange={(e) => sim.setDelay(1050 - Number(e.target.value))} className="mt-2 block" />
        </label>
      </section>

      <section className="flex flex-wrap gap-2">
        {playing
          ? <button className="btn btn-primary" onClick={sim.pause}><FiPause /> Pause</button>
          : <button className="btn btn-primary" onClick={sim.start} disabled={config && !running}><FiPlay /> {config && running ? 'Resume' : 'Start'}</button>}
        <button className="btn btn-ghost" onClick={sim.stepOnce} disabled={config && !running}><FiSkipForward /> Step</button>
        <button className="btn btn-ghost" onClick={sim.runSub} disabled={config && !running}><FiLayers /> Run subroutine</button>
        <button className="btn btn-ghost" onClick={sim.runAll} disabled={config && !running}><FiFastForward /> Run full machine</button>
        <button className="btn btn-ghost" onClick={sim.reset}><FiRotateCcw /> Reset</button>
        <button className="btn btn-ghost" onClick={sim.stop} disabled={!config}><FiSquare /> Stop</button>
      </section>

      {sim.errors.length > 0 && (
        <div role="alert" className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
          {sim.errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      )}
      {config && !running && config.status !== 'accepted' && config.status !== 'rejected' && (
        <div role="alert" className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-200">{config.message}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card">
            <Tape tape={config ? config.tape : (input || 'B').split('')} head={config ? config.head : 0} />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Step" value={config?.steps ?? 0} />
              <Stat label="Current module" value={config?.module ?? machine.mainModule} />
              <Stat label="Current state" value={config?.state ?? machine.startState} />
              <Stat label="Head / symbol" value={config ? `${config.head} / ${symbol}` : '-'} />
              <Stat label="Called from" value={caller?.module ?? (config ? 'none (top level)' : '-')} />
              <Stat label="Return state" value={caller?.returnState} />
              <Stat label="Read → Write" value={last && `${last.read} → ${last.write}`} />
              <Stat label="Move → Next" value={last && `${MOVE_LABELS[last.move]} → ${last.next}`} />
            </div>
            <p className="mt-3 rounded-md bg-navy-800 p-2 text-sm text-slate-300" aria-live="polite">
              {config ? (config.history.at(-1)?.action || 'Ready. Press Step or Start.') : 'Press Start, Step, or Run full machine to begin.'}
            </p>
          </section>
          <section className="card">
            <h3 className="mb-2 text-sm font-semibold text-slate-300">Transitions of {config?.module ?? machine.mainModule}</h3>
            <TransitionTable module={getModule(machine, config?.module ?? machine.mainModule)} state={config?.state ?? machine.startState} symbol={symbol ?? input[0] ?? 'B'} />
          </section>
          <ResultCard result={sim.result} />
          <section className="card"><ExecutionHistory history={config?.history || []} onClear={sim.clearHistory} /></section>
        </div>
        <aside className="card h-fit"><ModuleFlow machine={machine} config={config} playing={playing} /></aside>
      </div>
    </main>
  );
}
