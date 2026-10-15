/** Circular state diagram of one module. Edge label = read/write,move (and the called module). */
export default function StateDiagram({ module, machine }) {
  if (!module) return null;
  const halting = [machine.acceptState, machine.rejectState];
  const used = new Set([...module.states, ...module.transitions.filter((t) => !t.call && halting.includes(t.next)).map((t) => t.next)]);
  const nodes = [...used];
  const cx = 200, cy = 170, r = nodes.length > 1 ? 120 : 0;
  const pos = Object.fromEntries(nodes.map((n, i) => [n, [cx + r * Math.sin((2 * Math.PI * i) / nodes.length), cy - r * Math.cos((2 * Math.PI * i) / nodes.length)]]));
  const edges = {};
  module.transitions.forEach((t) => {
    if (!pos[t.state] || !pos[t.next]) return;
    const k = `${t.state}>${t.next}`;
    (edges[k] ||= []).push(`${t.read}/${t.write},${t.move}${t.call ? ` ⟶${t.call}` : ''}`);
  });
  return (
    <svg viewBox="0 0 400 340" className="w-full rounded-lg bg-navy-950" role="img" aria-label={`State diagram of ${module.name}`}>
      <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#64748b" /></marker></defs>
      {Object.entries(edges).map(([k, labels]) => {
        const [a, b] = k.split('>');
        const [x1, y1] = pos[a], [x2, y2] = pos[b];
        if (a === b) return <g key={k}><path d={`M${x1 - 8} ${y1 - 18} c-20 -34 36 -34 16 0`} fill="none" stroke="#64748b" markerEnd="url(#arr)" /><text x={x1} y={y1 - 48} fontSize="8" fill="#94a3b8" textAnchor="middle">{labels.join(' | ').slice(0, 40)}</text></g>;
        const d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d;
        return <g key={k}><line x1={x1 + ux * 20} y1={y1 + uy * 20} x2={x2 - ux * 22} y2={y2 - uy * 22} stroke="#64748b" markerEnd="url(#arr)" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 3} fontSize="8" fill="#94a3b8" textAnchor="middle">{labels.join(' | ').slice(0, 40)}</text></g>;
      })}
      {nodes.map((n) => {
        const [x, y] = pos[n];
        const stroke = n === machine.acceptState ? '#22c55e' : n === machine.rejectState ? '#ef4444' : n === module.entryState ? '#06b6d4' : n === module.exitState ? '#a855f7' : '#475569';
        return <g key={n}><circle cx={x} cy={y} r="18" fill="#1e293b" stroke={stroke} strokeWidth="2" /><text x={x} y={y + 3} fontSize="9" fill="#e2e8f0" textAnchor="middle">{n.length > 6 ? `${n.slice(0, 5)}…` : n}</text></g>;
      })}
      <text x="8" y="330" fontSize="9" fill="#94a3b8">cyan = entry · purple = exit · green = accept · red = reject</text>
    </svg>
  );
}
