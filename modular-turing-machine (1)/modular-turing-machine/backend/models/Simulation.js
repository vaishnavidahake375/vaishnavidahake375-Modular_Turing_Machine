import mongoose from 'mongoose';

const simulationSchema = new mongoose.Schema({
  machineId: { type: String, default: null },
  machineName: { type: String, default: 'Unsaved machine' },
  input: { type: String, default: '' },
  result: { type: String, enum: ['accepted', 'rejected', 'limit', 'error'], required: true },
  message: { type: String, default: '' },
  steps: { type: Number, default: 0 },
  finalState: String, finalTape: String,
  executionHistory: [mongoose.Schema.Types.Mixed],
  modulesUsed: [String],
  moduleTrail: [String],
  executionTime: { type: Number, default: 0 }, // milliseconds
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model('Simulation', simulationSchema);
