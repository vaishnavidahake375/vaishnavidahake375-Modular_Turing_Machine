import { Router } from 'express';
import c from '../controllers/simulationController.js';

const router = Router();
router.get('/stats', c.stats);          // must be before /:id
router.delete('/', c.clear);
router.route('/').get(c.list).post(c.create);
router.route('/:id').get(c.get).delete(c.remove);
export default router;
