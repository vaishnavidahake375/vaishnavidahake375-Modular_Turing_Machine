import { HttpError } from '../middleware/errorHandler.js';

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Builds list/get/create/update/remove handlers for a store. */
export function crudController(store, label, { prepare = (b) => b } = {}) {
  return {
    list: wrap(async (req, res) => res.json(await store.list())),
    get: wrap(async (req, res) => {
      const doc = await store.get(req.params.id);
      if (!doc) throw new HttpError(404, `${label} not found.`);
      res.json(doc);
    }),
    create: wrap(async (req, res) => res.status(201).json(await store.create(await prepare(req.body)))),
    update: wrap(async (req, res) => {
      const doc = await store.update(req.params.id, req.body);
      if (!doc) throw new HttpError(404, `${label} not found.`);
      res.json(doc);
    }),
    remove: wrap(async (req, res) => {
      const doc = await store.remove(req.params.id);
      if (!doc) throw new HttpError(404, `${label} not found.`);
      res.json({ success: true, message: `${label} deleted.` });
    }),
  };
}
export { wrap };
