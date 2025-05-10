const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db'); // Ensure sequelize is exported
const authRoutes = require('./routes/authRoutes');
const artRoutes = require('./routes/artRoutes');

// Load User and ArtPiece models to ensure they are registered with Sequelize
require('./models/User');
require('./models/ArtPiece');

dotenv.config();
connectDB(); // Connect to PostgreSQL

const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

app.get('/', (req, res) => {
  res.send('API is running... Deployed by YOUR_NAME'); // Add your name
});

app.use('/api/auth-yourname', authRoutes); // Add your name to route
app.use('/api/art-yourname', artRoutes);   // Add your name to route

// Sync database (creates tables if they don't exist)
// In production, you should use migrations. For this project, sync is fine.
// Place this after routes are defined, but before server starts listening
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true }); // alter: true tries to update tables to match model
        console.log("Database synchronized successfully. Models are up to date.");
    } catch (error) {
        console.error("Error synchronizing database:", error);
    }
};


const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  await syncDatabase(); // Sync DB before starting server fully
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});