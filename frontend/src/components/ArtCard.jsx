import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // If you have a detail page
import { FaUser, FaHashtag, FaEdit, FaTrash } from 'react-icons/fa';

const ArtCard = ({ art, artwork, showActions, onDelete }) => {
  // Support both prop naming styles
  const item = artwork || art;
  const [imageError, setImageError] = useState(false);
  const [directImageUrl, setDirectImageUrl] = useState(null);
  
  useEffect(() => {
    if (item) {
      console.log('ArtCard rendering item:', item);
      
      // Create direct URL immediately as a backup
      if (item.imagePath) {
        const directUrl = createDirectS3Url(item.imagePath);
        setDirectImageUrl(directUrl);
      }
    }
  }, [item]);
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!item) {
    return null;
  }

  // Create a direct S3 URL as fallback
  const createDirectS3Url = (imagePath) => {
    if (!imagePath) return null;
    return `https://s3.ap-southeast-2.amazonaws.com/metro-art/${imagePath}`;
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out"
    >
      <Link to={`/art/${item.id}`} className="block"> {/* Link to detail page */}
        <div className="relative w-full h-64 bg-gray-900">
          {!imageError ? (
            <img 
              src={item.imageUrl || directImageUrl} 
              alt={item.title} 
              className="w-full h-64 object-cover" 
              width="400"
              height="300"
              onLoad={() => console.log(`Image loaded for ${item.title}:`, item.imageUrl || directImageUrl)}
              onError={(e) => { 
                console.error(`Failed to load card image: ${item.imageUrl}`);
                setImageError(true);
                
                // Try direct S3 URL as fallback if not already tried
                if (directImageUrl && directImageUrl !== item.imageUrl) {
                  console.log("Trying direct URL:", directImageUrl);
                  e.target.src = directImageUrl;
                  e.target.onerror = () => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                  };
                } else {
                  e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-700">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-white mb-2">{item.title}</h3>
        <p className="text-gray-400 text-sm mb-3 h-16 overflow-y-auto">{item.description || "No description provided."}</p>
        <div className="flex items-center text-gray-500 text-xs mb-3">
          <FaUser className="mr-1" />
          <span>{item.artist?.username || 'Unknown Artist'}</span>
        </div>
        
        {/* Only show verification hash if it exists */}
        {item.verificationHash && (
          <div className="flex items-center text-gray-500 text-xs">
            <FaHashtag className="mr-1" />
            <span className="truncate" title={item.verificationHash}>
              {item.verificationHash.substring(0,10)}...
            </span>
          </div>
        )}
        
        {/* Show action buttons if showActions is true */}
        {showActions && (
          <div className="mt-4 flex justify-end space-x-2">
            <Link 
              to={`/edit-art/${item.id}`} 
              className="p-2 text-blue-400 hover:text-blue-300"
              title="Edit"
            >
              <FaEdit />
            </Link>
            <button
              onClick={() => onDelete && onDelete(item.id)}
              className="p-2 text-red-400 hover:text-red-300"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ArtCard;