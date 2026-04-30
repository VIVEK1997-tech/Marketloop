import express from 'express';
import { downloadInvoicePdf, getInvoiceByIdOrNumber, getInvoices } from '../controllers/invoice.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(protect);
router.get('/', asyncHandler(getInvoices));
router.get('/:invoiceIdOrNumber', asyncHandler(getInvoiceByIdOrNumber));
router.get('/:invoiceIdOrNumber/pdf', asyncHandler(downloadInvoicePdf));

export default router;
