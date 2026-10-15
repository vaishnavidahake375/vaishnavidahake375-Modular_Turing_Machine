import { NavLink, Link } from 'react-router-dom';
import { FiCpu } from 'react-icons/fi';

const links = [['/dashboard', 'Dashboard'], ['/simulator', 'Simulator'], ['/builder', 'Builder'], ['/modules', 'Modules'], ['/examples', 'Examples'], ['/history', 'History'], ['/learn', 'Learn']];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-navy-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold"><FiCpu className="text-cyan-400" /> Modular Turing Machine</Link>
        <div className="flex gap-1 overflow-x-auto">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-blue-600/20 text-blue-300' : 'text-slate-300 hover:text-white'}`}>{label}</NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
