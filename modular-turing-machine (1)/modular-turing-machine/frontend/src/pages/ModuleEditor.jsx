import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiCopy, FiTrash2 } from 'react-icons/fi';
import { useWorkingMachine } from '../utils/customMachine.js';
import { validateMachine, MOVES } from '../utils/turingMachine.js';
import StateDiagram from '../components/StateDiagram.jsx';

const inp = 'rounded-md border border-slate-600 bg-navy-800 p-1.5 text-sm';

export default function ModuleEditor() {
  const [machine, setMachine] = useWorkingMachine();
  const [sel, setSel] = useState(0);
  const mod = machine.modules[Math.min(sel, machine.modules.length - 1)];
  const idx = machine.modules.indexOf(mod);
  const errors = validateMachine(machine);
  const patch = (fn) => setMachine((m) => ({ ...m, modules: m.modules.map((x, i) => (i === idx ? fn(x) : x)) }));
  const setT = (i, k, v) => patch((x) => ({ ...x, transitions: x.transitions.map((t, j) => (j === i ? (k === 'call' && !v ? (({ call, ...rest }) => rest)(t) : { ...t, [k]: v }) : t)) }));
  const nextOptions = [...mod.states, machine.acceptState, machine.rejectState];

  const addModule = () => {
    const n = machine.modules.length;
    setMachine((m) => ({ ...m, modules: [...m.modules, { id: `m${Date.now()}`, name: `MODULE_${n}`, description: '', entryState: `s${n}_0`, exitState: `s${n}_1`, states: [`s${n}_0`, `s${n}_1`], transitions: [] }] }));
    setSel(n);
  };
  const duplicate = () => { setMachine((m) => ({ ...m, modules: [...m.modules, { ...structuredClone(mod), id: `m${Date.now()}`, name: `${mod.name}_COPY` }] })); setSel(machine.modules.length); };
  const remove = () => { if (mod.name === 'MAIN') return; setMachine((m) => ({ ...m, modules: m.modules.filter((x) => x !== mod) })); setSel(0); };
  // Renaming also updates every CALL that referenced the old name.
  const rename = (name) => {
    const old = mod.name; if (!name || name === old) return;
    setMachine((m) => ({ ...m, modules: m.modules.map((x) => ({ ...x, name: x === mod ? name : x.name, transitions: x.transitions.map((t) => (t.call === old ? { ...t, call: name } : t)) })) }));
  };
  const addT = () => patch((x) => ({ ...x, transitions: [...x.transitions, { state: x.entryState, read: machine.tapeAlphabet[0] || 'B', write: machine.tapeAlphabet[0] || 'B', move: 'R', next: x.entryState }] }));

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Module editor <span className="text-sm font-normal text-slate-400">({machine.name})</span></h1>
        <div className="flex gap-2"><Link className="btn btn-ghost" to="/builder">Machine builder</Link><Link className="btn btn-primary" to="/simulator?example=custom">Run in simulator</Link></div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {machine.modules.map((m, i) => <button key={m.id || m.name} onClick={() => setSel(i)} className={`btn ${i === idx ? 'btn-primary' : 'btn-ghost'} font-mono`}>{m.name}</button>)}
        <button className="btn btn-ghost" onClick={addModule}><FiPlus /> New</button>
        <button className="btn btn-ghost" onClick={duplicate}><FiCopy /> Duplicate</button>
        <button className="btn btn-ghost" onClick={remove} disabled={mod.name === 'MAIN'}><FiTrash2 /> Delete</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card space-y-3 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Name<input key={mod.name} className={`${inp} mt-1 block w-full font-mono`} defaultValue={mod.name} disabled={mod.name === 'MAIN'} onBlur={(e) => rename(e.target.value.trim().toUpperCase().replace(/\s+/g, '_'))} /></label>
            <label className="text-sm">States (comma separated)<input key={mod.states.join()} className={`${inp} mt-1 block w-full font-mono`} defaultValue={mod.states.join(', ')} onBlur={(e) => patch((x) => ({ ...x, states: [...new Set(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))] }))} /></label>
            <label className="text-sm">Entry state<select className={`${inp} mt-1 block w-full`} value={mod.entryState} onChange={(e) => patch((x) => ({ ...x, entryState: e.target.value }))}>{mod.states.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="text-sm">Exit state{mod.name === 'MAIN' ? ' (MAIN halts instead)' : ''}<select className={`${inp} mt-1 block w-full`} value={mod.exitState || ''} onChange={(e) => patch((x) => ({ ...x, exitState: e.target.value || null }))}><option value="">none (halts)</option>{mod.states.map((s) => <option key={s}>{s}</option>)}</select></label>
          </div>
          <label className="block text-sm">Description<textarea className={`${inp} mt-1 block w-full`} rows="2" value={mod.description || ''} onChange={(e) => patch((x) => ({ ...x, description: e.target.value }))} /></label>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400"><tr><th>State</th><th>Read</th><th>Write</th><th>Move</th><th>Next / return</th><th>Call module</th><th /></tr></thead>
              <tbody>
                {mod.transitions.map((t, i) => (
                  <tr key={i}>
                    <td><select className={inp} value={t.state} onChange={(e) => setT(i, 'state', e.target.value)}>{mod.states.map((s) => <option key={s}>{s}</option>)}</select></td>
                    <td><input className={`${inp} w-14 font-mono`} maxLength={1} value={t.read} onChange={(e) => setT(i, 'read', e.target.value)} /></td>
                    <td><input className={`${inp} w-14 font-mono`} maxLength={1} value={t.write} onChange={(e) => setT(i, 'write', e.target.value)} /></td>
                    <td><select className={inp} value={t.move} onChange={(e) => setT(i, 'move', e.target.value)}>{MOVES.map((s) => <option key={s}>{s}</option>)}</select></td>
                    <td><select className={inp} value={t.next} onChange={(e) => setT(i, 'next', e.target.value)}>{[...new Set(nextOptions)].map((s) => <option key={s}>{s}</option>)}</select></td>
                    <td><select className={inp} value={t.call || ''} onChange={(e) => setT(i, 'call', e.target.value)}><option value="">-</option>{machine.modules.map((m) => <option key={m.name}>{m.name}</option>)}</select></td>
                    <td><button aria-label="Delete transition" className="p-1 text-red-300" onClick={() => patch((x) => ({ ...x, transitions: x.transitions.filter((_, j) => j !== i) }))}><FiTrash2 /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-ghost" onClick={addT}><FiPlus /> Add transition</button>
          <p className="text-xs text-slate-500">Read * matches any symbol; write * keeps it. For a call, "Next / return" is the state the caller resumes in.</p>
        </section>
        <aside className="space-y-4">
          <div className="card"><h2 className="mb-2 text-sm font-semibold text-slate-300">Preview: {mod.name}</h2><StateDiagram module={mod} machine={machine} /></div>
          <div className={`card text-sm ${errors.length ? 'border-yellow-500/50' : 'border-green-500/40'}`}>
            <h2 className="mb-1 font-semibold">{errors.length ? `${errors.length} problem(s)` : 'Machine is valid'}</h2>
            <ul className="max-h-48 list-disc space-y-1 overflow-auto pl-5 text-xs text-yellow-200">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
