import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArtworkById } from '../services/api';
import { motion } from 'framer-motion';
import { FaUser, FaHashtag, FaArrowLeft } from 'react-icons/fa';

const ArtDetailPage = () => {
  const { id } = useParams();
  const [artPiece, setArtPiece] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchArt = async () => {
      try {
        setLoading(true);
        const { data } = await getArtworkById(id);
        console.log("Art detail data:", data);
        setArtPiece(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch art piece details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArt();
  }, [id]);

  // Create a direct S3 URL as fallback
  const createDirectS3Url = (imagePath) => {
    if (!imagePath) return null;
    return `https://s3.amazonaws.com/metro-art/${imagePath}`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full"
      ></motion.div>
    </div>
  );
  if (error) return <p className="text-center text-red-400 mt-10">{error}</p>;
  if (!artPiece) return <p className="text-center text-gray-400 mt-10">Art piece not found.</p>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-800 rounded-xl shadow-2xl"
    >
      <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
        <FaArrowLeft className="mr-2" /> Back to Gallery
      </Link>
      
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          {!imageError ? (
            <img 
              src={artPiece.imageUrl} 
              alt={artPiece.title} 
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
              onError={(e) => { 
                console.error(`Failed to load detail image: ${artPiece.imageUrl}`);
                setImageError(true);
                
                // Try direct S3 URL as fallback
                if (artPiece.imagePath) {
                  const directUrl = createDirectS3Url(artPiece.imagePath);
                  if (directUrl && directUrl !== artPiece.imageUrl) {
                    e.target.src = directUrl;
                  } else {
                    e.target.src = "https://via.placeholder.com/600x800?text=Image+Error";
                  }
                } else {
                  e.target.src = "https://via.placeholder.com/600x800?text=Image+Error";
                }
              }}
            />
          ) : (
            <div className="w-full h-[50vh] bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col justify-center"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            {artPiece.title}
          </h1>
          <div className="flex items-center text-gray-400 mb-4">
            <FaUser className="mr-2 text-blue-400" />
            <span>By {artPiece.artist?.username || 'Unknown Artist'}</span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-200 mt-6 mb-2">Description</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            {artPiece.description || "No description provided."}
          </p>

          <h2 className="text-xl font-semibold text-gray-200 mt-6 mb-2">Verification Hash</h2>
          <div className="flex items-center bg-gray-700 p-3 rounded-md">
            <FaHashtag className="mr-2 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm break-all select-all">
              {artPiece.verificationHash}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">This hash is a unique digital fingerprint for the artwork.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ArtDetailPage;