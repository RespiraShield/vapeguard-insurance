const express = require('express');
const upload = require('../config/upload');
const { validateFile } = require('../middleware/validation');
const {
  uploadBillPhoto,
  getBillPhoto,
  serveBillPhoto,
  deleteBillPhoto
} = require('../handlers/uploadHandler');

const router = express.Router();

/**
 * 📤 Upload Routes
 * Clean routes that delegate to handlers
 */

// POST /api/upload/bill-photo/:id - Upload bill photo
router.post('/bill-photo/:id', upload.single('billPhoto'), validateFile, uploadBillPhoto);

// GET /api/upload/bill-photo/:id - Get bill photo info
router.get('/bill-photo/:id', getBillPhoto);

// GET /api/upload/bill-photo/:id/file - Serve bill photo file
router.get('/bill-photo/:id/file', serveBillPhoto);

// DELETE /api/upload/bill-photo/:id - Delete bill photo
router.delete('/bill-photo/:id', deleteBillPhoto);

module.exports = router;
