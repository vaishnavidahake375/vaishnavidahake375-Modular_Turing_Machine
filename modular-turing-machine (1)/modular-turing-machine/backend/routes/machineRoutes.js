import { Router } from 'express';
import c from '../controllers/machineController.js';

const router = Router();
router.route('/').get(c.list).post(c.create);
router.route('/:id').get(c.get).put(c.update).delete(c.remove);
export default router;
