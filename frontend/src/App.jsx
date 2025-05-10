import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyArtPage from './pages/MyArtPage';
import UploadArtPage from './pages/UploadArtPage';
import ArtDetailPage from './pages/ArtDetailPage'; // You can create this for viewing single art
import { useAuth } from './contexts/AuthContext';
import { motion } from 'framer-motion';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>; // Or a spinner
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full"
        ></motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20"> {/* pt-20 for fixed navbar space */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/art/:id" element={<ArtDetailPage />} /> {/* Example detail page */}
          
          <Route path="/my-art" element={
            <ProtectedRoute>
              <MyArtPage />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <UploadArtPage />
            </ProtectedRoute>
          } />
          {/* Add a 404 page later */}
        </Routes>
      </main>
       <footer className="text-center py-4 text-sm text-gray-500">
        Digital Art Showcase - Deployed by YOUR_NAME
      </footer>
    </div>
  );
}

export default App;