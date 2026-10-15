export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const MOVE_LABELS = { L: 'Left', R: 'Right', S: 'Stay' };
export const STATUS_STYLES = {
  accepted: 'bg-green-500/15 text-green-300', rejected: 'bg-red-500/15 text-red-300',
  limit: 'bg-yellow-500/15 text-yellow-300', error: 'bg-yellow-500/15 text-yellow-300',
  running: 'bg-blue-500/15 text-blue-300',
};
