import React, { useState, useEffect } from 'react';
import { getAllArtworks } from '../services/api';
import ArtCard from '../components/ArtCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [artPieces, setArtPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArt = async () => {
      try {
        setLoading(true);
        const { data } = await getAllArtworks();
        setArtPieces(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch art pieces. The gallery is currently empty or there was an error.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArt();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
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

  return (
    <motion.div 
      className="animate-fadeIn"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Welcome to MetroArt
        </h1>
        <p className="text-lg text-gray-400 mt-2">Discover unique digital creations by artists from around the platform.</p>
      </div>
      
      {artPieces.length === 0 ? (
         <div className="text-center py-10">
          <p className="text-xl text-gray-500">The gallery is currently empty.</p>
          <Link to="/upload" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
            Be the first to upload!
          </Link>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {artPieces.map((art) => (
            <ArtCard key={art.id} art={art} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomePage;