import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Simulator from './pages/Simulator.jsx';
import Examples from './pages/Examples.jsx';
import Learn from './pages/Learn.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import MachineBuilder from './pages/MachineBuilder.jsx';
import ModuleEditor from './pages/ModuleEditor.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder" element={<MachineBuilder />} />
        <Route path="/modules" element={<ModuleEditor />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
