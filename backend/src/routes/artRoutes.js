const express = require('express');
const {
  createArtPiece,
  getAllArtPieces,
  getArtPieceById,
  getMyArtPieces,
  updateArtPiece,
  deleteArtPiece,
  serveImage
} = require('../controllers/artController');
const { protect } = require('../middleware/authMiddleware');
const { uploadToS3 } = require('../utils/s3Uploader');

const router = express.Router();

// Public routes
router.get('/', getAllArtPieces);
router.get('/image/:key', serveImage); // Route for serving images
// Add the detail endpoint as a public route first - important!
router.get('/:id', getArtPieceById);

// Protected routes
router.use(protect);
router.post('/', uploadToS3, createArtPiece);
// Move my-art route here, before any ID patterns, with clear naming
router.get('/my-artworks', getMyArtPieces);
router.put('/:id', updateArtPiece);
router.delete('/:id', deleteArtPiece);

module.exports = router;