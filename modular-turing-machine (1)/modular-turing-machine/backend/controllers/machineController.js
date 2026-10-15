import Machine from '../models/Machine.js';
import { createStore } from '../services/store.js';
import { crudController } from './crud.js';
import { validateMachine } from '../services/turingMachineService.js';
import { HttpError } from '../middleware/errorHandler.js';

export const machineStore = createStore(Machine);
export default crudController(machineStore, 'Machine', {
  prepare: (body) => {
    const errors = validateMachine(body);
    if (errors.length) throw new HttpError(400, errors.join(' '));
    return body;
  },
});
