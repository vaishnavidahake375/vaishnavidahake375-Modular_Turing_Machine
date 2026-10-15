/** Transitions of one module; the row that will fire next is highlighted. */
export default function TransitionTable({ module, state, symbol }) {
  if (!module) return null;
  const exact = module.transitions.find((t) => t.state === state && t.read === symbol);
  const next = exact || module.transitions.find((t) => t.state === state && t.read === '*');
  return (
    <div className="max-h-64 overflow-auto">
      <table className="w-full text-left font-mono text-xs">
        <thead className="sticky top-0 bg-navy-900 text-slate-400"><tr><th className="p-1">State</th><th>Read</th><th>Write</th><th>Move</th><th>Next</th><th>Call</th></tr></thead>
        <tbody>
          {module.transitions.map((t, i) => (
            <tr key={i} className={t === next ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-300'}>
              <td className="p-1">{t.state}</td><td>{t.read}</td><td>{t.write}</td><td>{t.move}</td><td>{t.next}</td><td>{t.call || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
