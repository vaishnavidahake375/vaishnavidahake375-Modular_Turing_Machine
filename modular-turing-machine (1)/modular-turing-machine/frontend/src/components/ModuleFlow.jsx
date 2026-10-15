import { motion } from 'framer-motion';

/** Call chain (MAIN -> ... -> current) plus every module, with the active one highlighted. */
export default function ModuleFlow({ machine, config, playing }) {
  const chain = config ? [...config.stack.map((f) => f.module), config.module] : [];
  const frames = config?.stack || [];
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Call stack</h3>
        {!config && <p className="text-sm text-slate-500">Start the machine to see the call stack.</p>}
        <div className="flex flex-col items-stretch gap-1">
          {chain.map((name, i) => (
            <div key={i}>
              <motion.div layout className={`rounded-md border px-3 py-2 text-sm ${i === chain.length - 1 ? 'border-purple-400 bg-purple-500/15 text-purple-100' : 'border-slate-600 bg-navy-800 text-slate-300'}`}>
                <span className="font-mono font-semibold">{name}</span>
                {frames[i] && <span className="ml-2 text-xs text-slate-400">returns to {frames[i].returnState}</span>}
                {i === chain.length - 1 && <span className="ml-2 text-xs text-purple-300">running</span>}
              </motion.div>
              {i < chain.length - 1 && <div className={`text-center text-slate-500 ${playing ? 'animate-pulse text-cyan-400' : ''}`}>↓ CALL</div>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Modules</h3>
        <ul className="space-y-1.5">
          {machine.modules.map((m) => {
            const active = config?.module === m.name;
            const waiting = config?.stack.some((f) => f.module === m.name);
            return (
              <li key={m.name} className={`rounded-md border px-3 py-2 text-sm ${active ? 'border-purple-400 bg-purple-500/15' : waiting ? 'border-blue-500/60 bg-blue-500/10' : 'border-slate-700 bg-navy-800'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold">{m.name}</span>
                  <span className="text-xs text-slate-400">{m.entryState} → {m.exitState || 'halts'}</span>
                </div>
                <p className="text-xs text-slate-400">{m.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
