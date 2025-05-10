const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.NODE_ENV === 'production'
  ? `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`
  : process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Database URL is not defined. Check your .env file or RDS environment variables.");
  process.exit(1);
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false // Adjust for RDS SSL
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected...');
    // Sync models - only use in dev, use migrations in prod
    // await sequelize.sync({ alter: true }); // { force: true } to drop and recreate
    // console.log("All models were synchronized successfully.");
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };