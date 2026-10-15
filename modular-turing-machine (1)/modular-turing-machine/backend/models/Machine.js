import mongoose from 'mongoose';
import { transitionSchema, moduleDefinition } from './Module.js';

const embeddedModule = new mongoose.Schema(moduleDefinition, { _id: false });

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  states: [String], inputAlphabet: [String], tapeAlphabet: [String],
  startState: { type: String, required: true },
  acceptState: { type: String, required: true },
  rejectState: { type: String, required: true },
  mainModule: { type: String, default: 'MAIN' },
  transitions: [transitionSchema], // optional flat transitions (MAIN module holds the real ones)
  modules: [embeddedModule],
}, { timestamps: true });

export default mongoose.model('Machine', machineSchema);
