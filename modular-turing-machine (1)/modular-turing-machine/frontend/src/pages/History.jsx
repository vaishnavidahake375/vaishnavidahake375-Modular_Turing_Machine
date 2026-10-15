import { Fragment, useEffect, useMemo, useState } from 'react';
import { simulationService } from '../services/simulationService.js';
import { STATUS_STYLES } from '../utils/constants.js';

const inp = 'rounded-md border border-slate-600 bg-navy-800 p-2 text-sm';

export default function History() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [open, setOpen] = useState(null);

  const load = () => simulationService.list().then((r) => { setRows(r); setError(''); }).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => {
    const s = rows.filter((r) => (filter === 'all' || r.result === filter) && `${r.input} ${r.machineName}`.toLowerCase().includes(q.toLowerCase()));
    const by = { newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt), steps: (a, b) => b.steps - a.steps };
    return s.sort(by[sort]);
  }, [rows, q, filter, sort]);

  const del = async (id) => { await simulationService.remove(id).catch((e) => setError(e.message)); load(); };
  const clear = async () => { if (window.confirm('Delete all simulation history?')) { await simulationService.clear().catch((e) => setError(e.message)); load(); } };

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Simulation history</h1>
      {error && <p role="alert" className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-200">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <input className={inp} placeholder="Search input or machine" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inp} value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All results</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="limit">Stopped (limit)</option></select>
        <select className={inp} value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="steps">Most steps</option></select>
        <button className="btn btn-ghost ml-auto" onClick={clear} disabled={!rows.length}>Delete all</button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-800 text-xs text-slate-400"><tr>{['Input', 'Machine', 'Result', 'Steps', 'Modules used', 'Date', ''].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>
            {shown.map((r) => (
              <Fragment key={r._id}>
                <tr className="border-t border-slate-800">
                  <td className="p-2 font-mono">{r.input}</td><td>{r.machineName}</td>
                  <td><span className={`badge ${STATUS_STYLES[r.result]}`}>{r.result}</span></td><td>{r.steps}</td>
                  <td className="text-xs">{(r.modulesUsed || []).join(', ')}</td><td className="text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="whitespace-nowrap p-2"><button className="btn btn-ghost py-1" onClick={() => setOpen(open === r._id ? null : r._id)}>Details</button> <button className="btn btn-ghost py-1 text-red-300" onClick={() => del(r._id)}>Delete</button></td>
                </tr>
                {open === r._id && (
                  <tr key={`${r._id}-d`} className="bg-navy-900"><td colSpan="7" className="p-3 text-xs text-slate-300">
                    <p>{r.message} Final state <span className="font-mono">{r.finalState}</span>, final tape <span className="font-mono">{r.finalTape || '(blank)'}</span>, {r.executionTime?.toFixed(2)} ms.</p>
                    <p className="mt-1 break-words">Module path: <span className="font-mono">{(r.moduleTrail || []).join(' → ')}</span></p>
                  </td></tr>
                )}
              </Fragment>
            ))}
            {!shown.length && <tr><td colSpan="7" className="p-6 text-center text-slate-500">No simulations yet. Run a machine in the simulator and it appears here.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
