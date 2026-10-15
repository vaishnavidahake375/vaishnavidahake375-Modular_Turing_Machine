import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tape from '../components/Tape.jsx';

const demo = '0110'.split('');

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-4xl font-bold sm:text-5xl">Subroutine-Based <span className="text-cyan-400">Modular</span> Turing Machine</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">Instead of one huge transition table, split a Turing Machine into small modules that call each other, run, and return. Watch the tape, the head and the call stack as it happens.</p>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card my-8">
        <Tape tape={demo} head={1} />
        <p className="mt-3 font-mono text-sm text-slate-300">MAIN <span className="text-cyan-400">→ CALL</span> FIND_RIGHT_END <span className="text-cyan-400">→ RETURN</span> MAIN → ACCEPT</p>
      </motion.div>
      <div className="flex flex-wrap gap-3">
        <Link to="/simulator" className="btn btn-primary">Start simulator</Link>
        <Link to="/learn" className="btn btn-ghost">Learn the concept</Link>
        <Link to="/examples" className="btn btn-ghost">Examples</Link>
        <Link to="/learn#docs" className="btn btn-ghost">Documentation</Link>
      </div>
    </main>
  );
}
