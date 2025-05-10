backend/
├── src/
│   ├── config/
│   │   └── db.js         # Database connection
│   ├── controllers/
│   │   ├── authController.js
│   │   └── artController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── ArtPiece.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── artRoutes.js
│   ├── utils/
│   │   └── s3Uploader.js # S3 upload helper
│   └── server.js       # Main server file
├── .env.example
├── Dockerfile
└── package.json