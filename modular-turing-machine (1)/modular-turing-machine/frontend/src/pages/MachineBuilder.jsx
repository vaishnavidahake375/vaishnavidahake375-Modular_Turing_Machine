import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkingMachine, normalize } from '../utils/customMachine.js';
import { EXAMPLES, getExample } from '../utils/examples.js';
import { validateMachine } from '../utils/turingMachine.js';
import { machineService } from '../services/machineService.js';
import StateDiagram from '../components/StateDiagram.jsx';

const inp = 'mt-1 block w-full rounded-md border border-slate-600 bg-navy-800 p-2 text-sm';
const list = (s) => [...new Set(s.split(',').map((x) => x.trim()).filter(Boolean))];

export default function MachineBuilder() {
  const [machine, setMachine] = useWorkingMachine();
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();
  const errors = validateMachine(machine);
  const set = (k, v) => setMachine((m) => ({ ...m, [k]: v }));
  const say = (text, ok = true) => setMsg({ text, ok });

  const save = async () => {
    try { const { _id, id, ...body } = machine; await machineService.create(body); say('Machine saved to the database.'); }
    catch (e) { say(e.message, false); }
  };
  const exportJson = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(machine, null, 2)], { type: 'application/json' }));
    a.download = `${machine.name.replace(/\W+/g, '_')}.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  const importJson = async (e) => {
    try { setMachine(normalize(JSON.parse(await e.target.files[0].text()))); say('Machine imported.'); }
    catch { say('That file is not valid machine JSON.', false); }
    e.target.value = '';
  };

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Machine builder</h1>
        <div className="flex flex-wrap gap-2">
          <select className="rounded-md border border-slate-600 bg-navy-800 p-2 text-sm" value="" onChange={(e) => e.target.value && setMachine(normalize(structuredClone(getExample(e.target.value))))}>
            <option value="">Start from template…</option>{EXAMPLES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <label className="btn btn-ghost cursor-pointer">Import JSON<input type="file" accept="application/json" hidden onChange={importJson} /></label>
          <button className="btn btn-ghost" onClick={exportJson}>Export JSON</button>
          <button className="btn btn-ghost" onClick={save} disabled={errors.length > 0}>Save to database</button>
          <button className="btn btn-primary" onClick={() => navigate('/simulator?example=custom')} disabled={errors.length > 0}>Run in simulator</button>
        </div>
      </div>
      {msg && <p role="status" className={`rounded-lg border p-2 text-sm ${msg.ok ? 'border-green-500/50 text-green-200' : 'border-red-500/50 text-red-200'}`}>{msg.text}</p>}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card space-y-3 lg:col-span-2">
          <label className="text-sm">Name<input className={inp} value={machine.name || ''} onChange={(e) => set('name', e.target.value)} /></label>
          <label className="text-sm">Description<textarea rows="2" className={inp} value={machine.description || ''} onChange={(e) => set('description', e.target.value)} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Input alphabet<input key={machine.inputAlphabet.join()} className={`${inp} font-mono`} defaultValue={machine.inputAlphabet.join(', ')} onBlur={(e) => set('inputAlphabet', list(e.target.value))} /></label>
            <label className="text-sm">Tape alphabet (must include B)<input key={machine.tapeAlphabet.join()} className={`${inp} font-mono`} defaultValue={machine.tapeAlphabet.join(', ')} onBlur={(e) => set('tapeAlphabet', list(e.target.value))} /></label>
            <label className="text-sm">Accept state<input className={`${inp} font-mono`} value={machine.acceptState} onChange={(e) => set('acceptState', e.target.value.trim())} /></label>
            <label className="text-sm">Reject state<input className={`${inp} font-mono`} value={machine.rejectState} onChange={(e) => set('rejectState', e.target.value.trim())} /></label>
          </div>
          <p className="text-sm text-slate-400">Start state: <span className="font-mono text-slate-200">{machine.startState}</span> (the entry state of MAIN). All states: <span className="font-mono text-slate-200">{machine.states.join(', ')}</span></p>
          <h2 className="pt-2 text-sm font-semibold text-slate-300">Modules and subroutine calls</h2>
          <ul className="space-y-1.5 text-sm">
            {machine.modules.map((m) => (
              <li key={m.name} className="rounded-md bg-navy-800 px-3 py-2">
                <span className="font-mono font-semibold">{m.name}</span> <span className="text-slate-400">{m.transitions.length} transitions · {m.entryState} → {m.exitState || 'halts'}</span>
                {[...new Set(m.transitions.filter((t) => t.call).map((t) => t.call))].length > 0 && <span className="ml-2 text-purple-300">calls {[...new Set(m.transitions.filter((t) => t.call).map((t) => t.call))].join(', ')}</span>}
              </li>
            ))}
          </ul>
          <Link to="/modules" className="btn btn-ghost">Edit modules and transitions</Link>
        </section>
        <aside className="space-y-4">
          <div className="card"><h2 className="mb-2 text-sm font-semibold text-slate-300">MAIN diagram</h2><StateDiagram module={machine.modules.find((m) => m.name === 'MAIN')} machine={machine} /></div>
          <div className="card text-sm"><h2 className="mb-1 font-semibold">{errors.length ? `${errors.length} problem(s)` : 'Machine is valid'}</h2>
            <ul className="max-h-48 list-disc space-y-1 overflow-auto pl-5 text-xs text-yellow-200">{errors.map((e) => <li key={e}>{e}</li>)}</ul></div>
        </aside>
      </div>
    </main>
  );
}
