'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, add the new column
    await queryInterface.addColumn('ArtPiece_YourNames', 'image_path', {
      type: Sequelize.STRING,
      allowNull: true, // Temporarily allow null for migration
    });

    // Copy data from imageUrl to image_path
    await queryInterface.sequelize.query(
      `UPDATE "ArtPiece_YourNames" SET "image_path" = "imageUrl"`
    );

    // Make the column not null
    await queryInterface.changeColumn('ArtPiece_YourNames', 'image_path', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Remove the old column
    await queryInterface.removeColumn('ArtPiece_YourNames', 'imageUrl');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the old column back
    await queryInterface.addColumn('ArtPiece_YourNames', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Copy data back
    await queryInterface.sequelize.query(
      `UPDATE "ArtPiece_YourNames" SET "imageUrl" = "image_path"`
    );

    // Remove the new column
    await queryInterface.removeColumn('ArtPiece_YourNames', 'image_path');
  }
};
