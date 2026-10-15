import { API_URL } from '../utils/constants.js';

/** fetch wrapper: JSON in/out, throws Error(message) with the server's message on failure. */
export async function api(path, opts = {}) {
  let res;
  try { res = await fetch(API_URL + path, { headers: { 'Content-Type': 'application/json' }, ...opts }); }
  catch { throw new Error('Cannot reach the API. Start the backend (cd backend && npm start).'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

/** Standard REST resource: list/get/create/update/remove. */
export const resource = (path) => ({
  list: () => api(path),
  get: (id) => api(`${path}/${id}`),
  create: (body) => api(path, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`${path}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => api(`${path}/${id}`, { method: 'DELETE' }),
});
