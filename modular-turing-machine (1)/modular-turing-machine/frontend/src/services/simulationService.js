import { api, resource } from './api.js';
const base = resource('/simulations');
export const simulationService = {
  ...base,
  /** Server re-runs {machine, input} and stores the result. */
  save: (body) => base.create(body),
  stats: () => api('/simulations/stats'),
  clear: () => api('/simulations', { method: 'DELETE' }),
};
