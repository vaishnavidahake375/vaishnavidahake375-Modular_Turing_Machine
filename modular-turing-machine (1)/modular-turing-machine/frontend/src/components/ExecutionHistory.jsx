import { useEffect, useRef } from 'react';

const KIND = { CALL: 'bg-purple-500/20 text-purple-200', RETURN: 'bg-cyan-500/20 text-cyan-200', STEP: 'bg-slate-700 text-slate-300' };

export default function ExecutionHistory({ history, onClear }) {
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [history.length]);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Execution history ({history.length})</h3>
        <button className="btn btn-ghost py-1" onClick={onClear} disabled={!history.length}>Clear history</button>
      </div>
      <div className="max-h-72 overflow-auto rounded-lg border border-slate-700">
        <table className="w-full text-left font-mono text-xs">
          <thead className="sticky top-0 bg-navy-800 text-slate-400"><tr>{['Step', 'Event', 'Module', 'State', 'Read', 'Write', 'Move', 'Next'].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-t border-slate-800">
                <td className="p-2">{h.step}</td>
                <td><span className={`badge ${KIND[h.kind]}`}>{h.kind}</span></td>
                <td>{h.module}</td><td>{h.state}</td><td>{h.read}</td><td>{h.write}</td><td>{h.move}</td><td>{h.next}</td>
              </tr>
            ))}
            {!history.length && <tr><td colSpan="8" className="p-4 text-center text-slate-500">No steps yet.</td></tr>}
          </tbody>
        </table>
        <div ref={end} />
      </div>
    </div>
  );
}
