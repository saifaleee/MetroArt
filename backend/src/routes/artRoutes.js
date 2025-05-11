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
router.get('/:id', getArtPieceById);
router.get('/image/:key', serveImage); // New route for serving images

// Protected routes
router.use(protect);
router.post('/', uploadToS3.single('artImage'), createArtPiece);
router.get('/my-art', getMyArtPieces);
router.put('/:id', updateArtPiece);
router.delete('/:id', deleteArtPiece);

module.exports = router;