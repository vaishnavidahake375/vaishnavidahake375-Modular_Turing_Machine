import mongoose from 'mongoose';

export const transitionSchema = new mongoose.Schema({
  state: { type: String, required: true }, read: { type: String, required: true },
  write: { type: String, required: true }, move: { type: String, enum: ['L', 'R', 'S'], required: true },
  next: { type: String, required: true }, call: { type: String },
}, { _id: false });

export const moduleDefinition = {
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  entryState: { type: String, required: true },
  exitState: { type: String, default: null },
  states: [String],
  transitions: [transitionSchema],
  inputRequirement: { type: String, default: '' },
  output: { type: String, default: '' },
  status: { type: String, default: 'ready' },
};

const moduleSchema = new mongoose.Schema(moduleDefinition, { timestamps: true });
export default mongoose.model('Module', moduleSchema);
