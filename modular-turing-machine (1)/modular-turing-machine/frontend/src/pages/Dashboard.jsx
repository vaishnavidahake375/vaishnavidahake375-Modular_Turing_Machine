import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiLayers, FiActivity, FiBarChart2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { simulationService } from '../services/simulationService.js';

const cards = [
  ['totalMachines', 'Total machines', FiCpu], ['totalModules', 'Total modules', FiLayers], ['simulations', 'Simulations completed', FiActivity],
  ['averageSteps', 'Average steps', FiBarChart2], ['accepted', 'Accepted inputs', FiCheckCircle], ['rejected', 'Rejected inputs', FiXCircle],
];
const actions = [['/builder', 'Create machine'], ['/examples', 'Load example'], ['/simulator', 'Run simulation'], ['/modules', 'View modules'], ['/history', 'View history']];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { simulationService.stats().then(setStats).catch((e) => setError(e.message)); }, []);
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {error && <p role="alert" className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-200">{error} The simulator still works without it.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(([k, label, Icon]) => (
          <div key={k} className="card flex items-center gap-3"><Icon className="text-2xl text-cyan-400" /><div><div className="text-2xl font-semibold">{stats ? stats[k] : '-'}</div><div className="text-xs text-slate-400">{label}</div></div></div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">{actions.map(([to, l]) => <Link key={to} to={to} className="btn btn-ghost">{l}</Link>)}</div>
    </main>
  );
}
