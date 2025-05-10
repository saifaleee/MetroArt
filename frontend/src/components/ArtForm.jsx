import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ArtForm = ({ initialData, onSubmit, buttonText = 'Submit', isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    medium: '',
    tags: '',
    isPublished: true,
    file: null,
    ...initialData
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // If initialData changes, update the form
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Convert array of tags to comma-separated string if needed
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || ''
      }));
    }
    
    // Set preview if we have an image URL from initialData
    if (initialData?.imageUrl) {
      setPreview(initialData.imageUrl);
    }
  }, [initialData]);
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.medium.trim()) newErrors.medium = 'Medium is required';
    
    // File is only required for new uploads, not edits
    if (!initialData?.id && !formData.file) {
      newErrors.file = 'Please select an image file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (files && files[0]) {
        setFormData({ ...formData, file: files[0] });
        
        // Create a preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert tags string to array
      const processedData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      onSubmit(processedData);
    }
  };
  
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Give your artwork a title"
        />
        {errors.title && <p className="mt-1 text-red-400 text-sm">{errors.title}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about your artwork"
        ></textarea>
        {errors.description && <p className="mt-1 text-red-400 text-sm">{errors.description}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="medium" className="block text-gray-300 mb-2">
          Medium *
        </label>
        <input
          type="text"
          id="medium"
          name="medium"
          value={formData.medium}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="E.g. Digital Painting, 3D Render, Photography"
        />
        {errors.medium && <p className="mt-1 text-red-400 text-sm">{errors.medium}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="tags" className="block text-gray-300 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="E.g. portrait, landscape, abstract"
        />
        <p className="mt-1 text-gray-400 text-sm">Separate tags with commas</p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="file" className="block text-gray-300 mb-2">
          Artwork Image {!initialData?.id && '*'}
        </label>
        <input
          type="file"
          id="file"
          name="file"
          onChange={handleChange}
          accept="image/*"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.file && <p className="mt-1 text-red-400 text-sm">{errors.file}</p>}
        
        {preview && (
          <div className="mt-3 relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-80 object-contain rounded"
            />
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="mr-2 h-5 w-5 rounded border-gray-300"
          />
          <span className="text-gray-300">Publish immediately</span>
        </label>
        <p className="mt-1 text-gray-400 text-sm">
          Uncheck to save as draft
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Processing...' : buttonText}
        </button>
      </div>
    </motion.form>
  );
};

export default ArtForm; 