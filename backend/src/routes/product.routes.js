import express from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  deleteProduct,
  getNearbyProducts,
  getProduct,
  getProducts,
  getSellerProducts,
  markSold,
  updateProduct
} from '../controllers/product.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

const productValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('location').trim().notEmpty().withMessage('Location is required')
];

router.get('/', getProducts);
router.get('/nearby', getNearbyProducts);
router.get('/seller/me', protect, authorize('seller', 'admin'), getSellerProducts);
router.get('/seller/:sellerId', getSellerProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 6), productValidators, validate, createProduct);
router.put('/:id', protect, upload.array('images', 6), updateProduct);
router.patch('/:id/sold', protect, markSold);
router.delete('/:id', protect, deleteProduct);

export default router;
