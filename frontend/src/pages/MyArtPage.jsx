import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ArtCard from '../components/ArtCard';
import { getUserArtworks, deleteArtwork } from '../services/api';

const MyArtPage = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'
  const { user } = useAuth();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const response = await getUserArtworks();
        console.log('Art data received:', response.data);
        setArtworks(response.data);
        setError(null);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load your artworks. Please try again later.';
        setError(errorMsg);
        
        // Check token status
        const token = localStorage.getItem('artToken_yourname');
        if (!token) {
          console.error('Authentication token missing. User might need to log in again.');
        }
        
        console.error('Error fetching artworks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this artwork?')) {
      try {
        await deleteArtwork(id);
        setArtworks(artworks.filter(art => art.id !== id));
      } catch (err) {
        setError('Failed to delete artwork. Please try again.');
        console.error('Error deleting artwork:', err);
      }
    }
  };

  const filteredArtworks = filter === 'all' 
    ? artworks 
    : artworks.filter(art => 
        filter === 'published' ? art.isPublished : !art.isPublished
      );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Artwork</h1>
        <Link 
          to="/upload" 
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          Upload New Art
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded ${filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('published')} 
            className={`px-4 py-2 rounded ${filter === 'published' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Published
          </button>
          <button 
            onClick={() => setFilter('draft')} 
            className={`px-4 py-2 rounded ${filter === 'draft' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Drafts
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-400 mb-4">
            {filter === 'all' 
              ? "You haven't uploaded any artwork yet" 
              : filter === 'published' 
                ? "You don't have any published artwork" 
                : "You don't have any drafts"}
          </p>
          {filter === 'all' && (
            <Link to="/upload" className="text-blue-400 hover:underline">
              Upload your first piece now
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map(artwork => (
            <ArtCard 
              key={artwork.id} 
              artwork={artwork} 
              showActions={true}
              onDelete={() => handleDelete(artwork.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyArtPage; 