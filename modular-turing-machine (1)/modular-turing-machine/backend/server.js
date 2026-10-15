import dotenv from 'dotenv';
dotenv.config();
import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import machineRoutes from './routes/machineRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/machines', machineRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/simulations', simulationRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
await connectDB();
app.listen(PORT, () => console.log(`[server] API listening on http://localhost:${PORT}/api`));
