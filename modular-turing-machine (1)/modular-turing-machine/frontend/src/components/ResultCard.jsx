import { STATUS_STYLES } from '../utils/constants.js';

const LABEL = { accepted: 'ACCEPTED', rejected: 'REJECTED', limit: 'STOPPED', error: 'ERROR' };

export default function ResultCard({ result }) {
  if (!result) return null;
  const rows = [
    ['Input', result.input], ['Total steps', result.steps], ['Modules executed', result.modulesUsed.length],
    ['Execution time', `${(result.executionTime / 1000).toFixed(4)} s`], ['Final state', result.finalState], ['Final tape', result.finalTape || '(blank)'],
  ];
  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Simulation completed</h3>
        <span className={`badge ${STATUS_STYLES[result.status]}`}>{LABEL[result.status]}</span>
      </div>
      <p className="mb-3 text-sm text-slate-400">{result.message}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {rows.map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-mono">{v}</dd></div>)}
      </dl>
      <p className="mt-3 break-words text-xs text-slate-400">Module path: <span className="font-mono text-slate-300">{result.moduleTrail.join(' → ')}</span></p>
    </div>
  );
}
