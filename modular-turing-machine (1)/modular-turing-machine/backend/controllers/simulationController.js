import Simulation from '../models/Simulation.js';
import { createStore } from '../services/store.js';
import { crudController, wrap } from './crud.js';
import { machineStore } from './machineController.js';
import { moduleStore } from './moduleController.js';
import { run } from '../services/turingMachineService.js';
import { HttpError } from '../middleware/errorHandler.js';

export const simulationStore = createStore(Simulation);

/** Convert an engine result into the stored Simulation shape. */
const toRecord = (r, machine, machineId) => ({
  machineId: machineId || null, machineName: machine?.name || 'Unsaved machine',
  input: r.input, result: r.status, message: r.message, steps: r.steps,
  finalState: r.finalState, finalTape: r.finalTape, executionHistory: r.executionHistory,
  modulesUsed: r.modulesUsed, moduleTrail: r.moduleTrail, executionTime: r.executionTime,
});

const base = crudController(simulationStore, 'Simulation', {
  // Body may be { machineId | machine, input, maxSteps } (server runs it) or an already computed record.
  prepare: async (body) => {
    if (body.machineId || body.machine) {
      const machine = body.machine || (await machineStore.get(body.machineId));
      if (!machine) throw new HttpError(404, 'Machine not found.');
      const r = run(machine, body.input ?? '', { maxSteps: body.maxSteps || 1000 });
      if (r.status === 'error') throw new HttpError(400, r.errors.join(' '));
      return toRecord(r, machine, body.machineId);
    }
    if (!body.result) throw new HttpError(400, 'Provide machine/machineId + input, or a finished simulation record.');
    return body;
  },
});

/** Delete every simulation. */
const clear = wrap(async (req, res) => { await simulationStore.clear(); res.json({ success: true }); });

/** Dashboard numbers. */
const stats = wrap(async (req, res) => {
  const [machines, modules, sims] = await Promise.all([machineStore.list(), moduleStore.list(), simulationStore.list()]);
  const embedded = machines.reduce((n, m) => n + (m.modules?.length || 0), 0);
  res.json({
    totalMachines: machines.length, totalModules: modules.length + embedded, simulations: sims.length,
    averageSteps: sims.length ? Math.round(sims.reduce((s, x) => s + (x.steps || 0), 0) / sims.length) : 0,
    accepted: sims.filter((s) => s.result === 'accepted').length,
    rejected: sims.filter((s) => s.result === 'rejected').length,
  });
});

export default { ...base, clear, stats };
