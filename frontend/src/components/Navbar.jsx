import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaPalette, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaCloudUploadAlt, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gray-800 shadow-lg fixed w-full top-0 left-0 z-50"
    >
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center text-xl font-semibold text-white hover:text-blue-400 transition-colors">
          <FaPalette className="mr-2 text-blue-400" />
          MetroArt
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <NavLink to="/upload" icon={<FaCloudUploadAlt />}>Upload Art</NavLink>
              <NavLink to="/my-art" icon={<FaUserCircle />}>My Art</NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
              <span className="text-gray-300 hidden md:block">Hi, {user.username}!</span>
            </>
          ) : (
            <>
              <NavLink to="/login" icon={<FaSignInAlt />}>Login</NavLink>
              <NavLink to="/register" icon={<FaUserPlus />}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, children, icon }) => (
  <Link
    to={to}
    className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
  >
    {icon && React.cloneElement(icon, {className: "mr-2"})}
    {children}
  </Link>
);

export default Navbar;