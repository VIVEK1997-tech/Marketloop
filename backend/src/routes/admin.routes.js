import express from 'express';
import { body } from 'express-validator';
import { getStats, getUsers, removeListing, setBanStatus } from '../controllers/admin.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:userId/ban', body('isBanned').isBoolean().withMessage('isBanned must be a boolean'), validate, setBanStatus);
router.delete('/products/:productId', removeListing);

export default router;
