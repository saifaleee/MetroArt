# Project: Digital Art Showcase (Cloud Deployment - MetroArt)

This project is a cloud-based web application for showcasing digital art, deployed on AWS infrastructure following modern cloud-native principles. It consists of a React frontend and a Node.js backend, with separate deployments.

**Deployed by: YOUR_NAME**

## Features

* **User Authentication:** Users can register and log in.
* **CRUD Operations:** Users can upload (Create), view (Read), and manage their own art pieces. (Update/Delete can be added for authenticated users on their own art).
* **Database Operations:** User management and art piece metadata are stored in Amazon RDS (PostgreSQL).
* **File and Image Upload:** Art images are securely uploaded to and served from AWS S3.
* **"Verification Hash":** Each art piece gets a unique hash, simulating a simple blockchain-like verification.
* **Stylish Frontend:** Modern UI with Tailwind CSS and animations using Framer Motion.

## Tech Stack

**Frontend:**
* React (with Vite)
* React Router for navigation
* Axios for API calls
* Tailwind CSS for styling
* Framer Motion for animations
* Context API for state management (Authentication)
* Deployment: AWS Elastic Beanstalk

**Backend:**
* Node.js with Express.js
* PostgreSQL with Sequelize ORM
* JWT (JSON Web Tokens) for authentication
* Multer and `aws-sdk` (via `multer-s3`) for S3 file uploads
* Docker for containerization
* Deployment: Docker container on Amazon EC2

**AWS Services Used:**
* Amazon EC2 (for backend hosting)
* Amazon Elastic Beanstalk (for frontend hosting)
* Amazon RDS (PostgreSQL database)
* Amazon S3 (for image storage)
* Amazon ECR (Elastic Container Registry for Docker images)
* AWS IAM (for roles and policies)
* Amazon CloudWatch (for logging)
* (Optional Bonus) Amazon Route 53 (for custom domain)
* (Optional Bonus) AWS Certificate Manager (ACM for HTTPS)

## Project Structure
```
.
├── backend/                # Node.js/Express backend application
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React frontend application
│   ├── src/
│   └── package.json
├── Cloud_Deployment.md     # Step-by-step AWS deployment guide
└── README.md               # This file
```

## Local Development Setup

**Prerequisites:**
* Node.js (v18+ recommended)
* npm or yarn
* Docker (for backend)
* A local PostgreSQL instance or a cloud-hosted one (e.g., ElephantSQL free tier).
* AWS Account and AWS CLI configured (for S3 uploads from local dev if desired, otherwise mock S3 or skip upload part locally).

**1. Backend Setup:**
```bash
cd backend
npm install

# Create a .env file from .env.example and fill in your details:
# PORT=3001
# DATABASE_URL=postgresql://user:password@host:port/database_name
# JWT_SECRET=YOUR_VERY_SECRET_JWT_KEY_YOURNAME
# AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID (for local S3 uploads)
# AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY (for local S3 uploads)
# AWS_REGION=your-aws-region
# S3_BUCKET_NAME=your-unique-s3-bucket-name-yourname

npm run dev
# The backend should now be running on http://localhost:3001
```

Ensure your PostgreSQL database is running and the DATABASE_URL is correct. The tables will be synced automatically on first run (due to sequelize.sync({ alter: true })).

**2. Frontend Setup:**
```bash
cd frontend
npm install

# Create a .env file from .env.example and fill in your details:
# VITE_API_BASE_URL=http://localhost:3001/api

npm run dev
# The frontend should now be running on http://localhost:5173 (or another port shown by Vite)
```

## Cloud Deployment

Refer to the Cloud_Deployment.md file for detailed step-by-step instructions on deploying this application to AWS.

## Live Demo Links (Example - Replace with yours after deployment)

* Frontend URL (Elastic Beanstalk): [YOUR_ELASTICBEANSTALK_URL_HERE]
* Backend API Base URL (EC2): http://[YOUR_EC2_PUBLIC_IP_HERE]:3001/api

## Important Notes from Project Requirements

* This application consists of two separate components (frontend and backend) deployed independently.
* Full-stack frameworks that merge backend and frontend (e.g., Next.js full-stack mode) were not used.
* All resource names on AWS should include your name/group identifier for tracking.
* Focus on using AWS Free Tier eligible services where possible, but monitor billing.

---

This is a massive undertaking! Remember to:
1. **Fill in ALL placeholders** like `YOUR_NAME`, `your-region`, `your-aws-account-id`, S3 bucket names, database credentials, JWT secrets, etc.
2. **Test each step locally** before moving to cloud deployment.
3. **Take screenshots** as you go through the AWS console steps for your PDF documentation.
4. **Create an architecture diagram.** Tools like diagrams.net (draw.io) are great for this.
5. **Start early!** This will take time to implement and debug.

Good luck with your project! 
