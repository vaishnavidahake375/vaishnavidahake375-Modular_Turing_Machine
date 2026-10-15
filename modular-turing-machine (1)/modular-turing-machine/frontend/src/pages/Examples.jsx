import { Link } from 'react-router-dom';
import { EXAMPLES } from '../utils/examples.js';

export default function Examples() {
  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Example machines</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {EXAMPLES.map((m) => (
          <article key={m.id} className="card flex flex-col">
            <h2 className="font-semibold">{m.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{m.description}</p>
            <p className="mt-2 text-xs text-slate-400">Modules: <span className="font-mono text-slate-300">{m.modules.map((x) => x.name).join(', ')}</span></p>
            <p className="mt-1 text-xs text-slate-400">Samples: {m.samples.map(([s, r]) => `${s} → ${r}`).join(' · ')}</p>
            <Link to={`/simulator?example=${m.id}`} className="btn btn-primary mt-4 self-start">Open in simulator</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
