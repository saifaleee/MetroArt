import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArt } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import ArtForm from '../components/ArtForm';

const UploadArtPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (formData) => {
    setError('');
    setLoading(true);

    // Create FormData object for the API call
    const apiFormData = new FormData();
    apiFormData.append('title', formData.title);
    apiFormData.append('description', formData.description);
    apiFormData.append('medium', formData.medium);
    apiFormData.append('tags', JSON.stringify(formData.tags));
    apiFormData.append('isPublished', formData.isPublished);
    apiFormData.append('artImage', formData.file); // Key 'artImage' must match backend (multer fieldname)

    try {
      await createArt(apiFormData);
      navigate('/my-art'); // Redirect to user's art page or gallery
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-8">
        Upload Your Masterpiece
      </h2>
      
      {error && (
        <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}
      
      <ArtForm 
        onSubmit={handleSubmit}
        buttonText="Upload Artwork"
        isLoading={loading}
      />
    </motion.div>
  );
};

export default UploadArtPage;