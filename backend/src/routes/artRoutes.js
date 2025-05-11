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

// Protected routes
router.use(protect);
router.post('/', uploadToS3.single('artImage'), createArtPiece);
// Move my-art route here, before any ID patterns, with clear naming
router.get('/my-artworks', getMyArtPieces);
router.put('/:id', updateArtPiece);
router.delete('/:id', deleteArtPiece);

// Public route for getting individual art piece - AFTER specific routes but before the middleware
router.get('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', getArtPieceById);

module.exports = router;