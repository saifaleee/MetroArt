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
router.get('/my-art', getMyArtPieces); // Make sure this is BEFORE the /:id route
router.put('/:id', updateArtPiece);
router.delete('/:id', deleteArtPiece);

// This should be LAST to prevent conflicts with named routes
router.get('/:id', getArtPieceById);

module.exports = router;