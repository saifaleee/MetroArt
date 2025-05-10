import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await register(formData.username, formData.email, formData.password);
        navigate('/');
      } catch (error) {
        setErrors({ submit: error.message || 'Registration failed' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.username && <p className="mt-1 text-red-400 text-sm">{errors.username}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="mt-1 text-red-400 text-sm">{errors.email}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="mt-1 text-red-400 text-sm">{errors.password}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.confirmPassword && <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword}</p>}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-400">
        Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
      </p>
    </motion.div>
  );
};

export default RegisterPage; 