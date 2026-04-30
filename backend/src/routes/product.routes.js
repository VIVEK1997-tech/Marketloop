import express from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  deleteProduct,
  getNearbyProducts,
  getProductCategories,
  getProduct,
  getPersonalizedRecommendations,
  getProductRecommendations,
  getProducts,
  getSellerProducts,
  markSold,
  updateProduct
} from '../controllers/product.controller.js';
import { authorize, optionalProtect, protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UOM_VALUES } from '../utils/uom.js';

const router = express.Router();

const productValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('unit').optional().isIn(UOM_VALUES).withMessage(`Unit must be one of: ${UOM_VALUES.join(', ')}`),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('crateWeightKg').optional().isFloat({ min: 0 }).withMessage('Crate weight must be a positive number'),
  body('truckWeightKg').optional().isFloat({ min: 8000, max: 20000 }).withMessage('Truck weight must be between 8000 and 20000 Kg'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('location').trim().notEmpty().withMessage('Location is required')
];

router.get('/', asyncHandler(getProducts));
router.get('/categories', asyncHandler(getProductCategories));
router.get('/nearby', asyncHandler(getNearbyProducts));
router.get('/recommendations/for-you', optionalProtect, asyncHandler(getPersonalizedRecommendations));
router.get('/seller/me', protect, authorize('seller', 'admin'), asyncHandler(getSellerProducts));
router.get('/seller/:sellerId', asyncHandler(getSellerProducts));
router.get('/:id/recommendations', optionalProtect, asyncHandler(getProductRecommendations));
router.get('/:id', asyncHandler(getProduct));
router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 6), productValidators, validate, asyncHandler(createProduct));
router.put('/:id', protect, upload.array('images', 6), asyncHandler(updateProduct));
router.patch('/:id/sold', protect, asyncHandler(markSold));
router.delete('/:id', protect, asyncHandler(deleteProduct));

export default router;
