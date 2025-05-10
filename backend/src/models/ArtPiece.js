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
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationHash: {
    type: DataTypes.STRING,
    allowNull: false,
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

ArtPiece.beforeValidate((artPiece) => {
  if (artPiece.title && artPiece.description && artPiece.artistId && !artPiece.verificationHash) {
    const dataToHash = `${artPiece.title}-${artPiece.description}-${artPiece.artistId}-${Date.now()}`;
    artPiece.verificationHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  }
});

User.hasMany(ArtPiece, { foreignKey: 'artistId', as: 'artPieces' });
ArtPiece.belongsTo(User, { foreignKey: 'artistId', as: 'artist' });

module.exports = ArtPiece;