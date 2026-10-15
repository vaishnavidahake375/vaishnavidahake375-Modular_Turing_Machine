import Module from '../models/Module.js';
import { createStore } from '../services/store.js';
import { crudController } from './crud.js';

export const moduleStore = createStore(Module);
export default crudController(moduleStore, 'Module');
