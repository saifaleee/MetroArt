import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // If you have a detail page
import { FaUser, FaHashtag, FaEdit, FaTrash } from 'react-icons/fa';

const ArtCard = ({ art, artwork, showActions, onDelete }) => {
  // Support both prop naming styles
  const item = artwork || art;
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!item) {
    return null;
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out"
    >
      <Link to={`/art/${item.id}`} className="block"> {/* Link to detail page */}
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-64 object-cover" 
          onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/400x300?text=Image+Not+Found"; }} // Fallback image
        />
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