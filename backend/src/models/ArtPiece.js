const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const crypto = require('crypto');

const ArtPiece = sequelize.define('ArtPiece_YourName', { // Add YourName
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_path' // Use snake_case for the database column
  },
  verificationHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_published' 
  },
  artistId: { // Foreign key
    type: DataTypes.UUID,
    references: {
      model: User, // Reference the User model
      key: 'id',
    },
    allowNull: false,
  },
});

// Hash is now created from the image data directly in the controller
// No automatic hash generation needed here

User.hasMany(ArtPiece, { foreignKey: 'artistId', as: 'artPieces' });
ArtPiece.belongsTo(User, { foreignKey: 'artistId', as: 'artist' });

module.exports = ArtPiece;