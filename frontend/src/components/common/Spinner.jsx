import React from 'react';
import { motion } from 'framer-motion';

const Spinner = ({ size = 'md', color = 'blue', fullScreen = false }) => {
  // Size classes
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4'
  };

  // Color classes
  const colorMap = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
    pink: 'border-pink-500',
    white: 'border-white'
  };

  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass = colorMap[color] || colorMap.blue;

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClass} ${colorClass} rounded-full border-t-transparent`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      {spinner}
    </div>
  );
};

export default Spinner; 