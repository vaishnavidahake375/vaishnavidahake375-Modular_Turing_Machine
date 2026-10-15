import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

export const dbReady = () => mongoose.connection.readyState === 1;

/**
 * Generic repository: uses MongoDB when connected, otherwise an in-memory Map,
 * so the whole API works with zero database setup.
 */
export function createStore(Model) {
  const mem = new Map();
  const valid = (id) => mongoose.isValidObjectId(id);
  return {
    async list() { return dbReady() ? Model.find().sort({ createdAt: -1 }).lean() : [...mem.values()].reverse(); },
    async get(id) { return dbReady() ? (valid(id) ? Model.findById(id).lean() : null) : mem.get(id) || null; },
    async create(data) {
      if (dbReady()) return (await Model.create(data)).toObject();
      const now = new Date().toISOString();
      const doc = { ...data, _id: randomUUID(), createdAt: now, updatedAt: now };
      mem.set(doc._id, doc); return doc;
    },
    async update(id, data) {
      if (dbReady()) return valid(id) ? Model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean() : null;
      const cur = mem.get(id); if (!cur) return null;
      const doc = { ...cur, ...data, _id: id, updatedAt: new Date().toISOString() };
      mem.set(id, doc); return doc;
    },
    async remove(id) {
      if (dbReady()) return valid(id) ? Model.findByIdAndDelete(id).lean() : null;
      const cur = mem.get(id); mem.delete(id); return cur || null;
    },
    async clear() { if (dbReady()) await Model.deleteMany({}); else mem.clear(); },
  };
}
