import express from 'express';
import { body } from 'express-validator';
import { addToWishlist, becomeSeller, getProfile, getUserRatings, getWishlist, removeFromWishlist, switchActiveRole, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.get('/:id/ratings', getUserRatings);

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/roles/become-seller', becomeSeller);
router.post('/roles/switch', [body('role').isIn(['buyer', 'seller', 'admin']).withMessage('role must be buyer, seller, or admin')], validate, switchActiveRole);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

export default router;
