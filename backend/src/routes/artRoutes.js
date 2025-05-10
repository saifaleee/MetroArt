const express = require('express');
const {
  createArtPiece,
  getAllArtPieces,
  getArtPieceById,
  getMyArtPieces,
  updateArtPiece,
  deleteArtPiece,
} = require('../controllers/artController');
const { protect } = require('../middleware/authMiddleware');
const { uploadToS3 } = require('../utils/s3Uploader');

const router = express.Router();

// Note: uploadToS3.single('artImage') middleware must come before createArtPiece controller
// It needs req.user for naming, so 'protect' comes first.
router.post('/', protect, uploadToS3.single('artImage'), createArtPiece);

router.get('/', getAllArtPieces); // Public
router.get('/my-art', protect, getMyArtPieces); // Protected
router.get('/:id', getArtPieceById); // Public

router.put('/:id', protect, updateArtPiece);
router.delete('/:id', protect, deleteArtPiece);

module.exports = router;