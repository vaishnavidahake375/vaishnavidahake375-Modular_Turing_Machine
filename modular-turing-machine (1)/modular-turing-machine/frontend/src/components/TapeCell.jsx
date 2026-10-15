import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/** One tape cell. The head marker uses a shared layoutId so it slides between cells. */
const TapeCell = forwardRef(function TapeCell({ symbol, index, active }, ref) {
  return (
    <div ref={ref} className="flex w-12 shrink-0 flex-col items-center gap-1">
      <div className={`flex h-12 w-12 items-center justify-center rounded-md border text-lg font-mono ${active ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200' : 'border-slate-600 bg-navy-800'} ${symbol === 'B' ? 'text-slate-500' : ''}`}>{symbol}</div>
      <span className="text-[10px] text-slate-500">{index}</span>
      <div className="h-4">{active && <motion.div layoutId="head" className="text-cyan-400" transition={{ type: 'spring', stiffness: 400, damping: 32 }}>▲</motion.div>}</div>
    </div>
  );
});
export default TapeCell;
