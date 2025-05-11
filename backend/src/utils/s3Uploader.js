const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const crypto = require('crypto');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Create S3 client with access point
const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: process.env.AWS_REGION,
    signatureVersion: 'v4',
    // Use the access point ARN in the params
    params: {
        Bucket: process.env.S3_BUCKET_NAME
    },
    // For development only - in production, use proper SSL certificate
    httpOptions: {
        rejectUnauthorized: false
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG, PNG, or GIF is allowed!'), false);
    }
};

// First, set up memory storage for processing the file before uploading to S3
const memoryStorage = multer.memoryStorage();

// Create a two-stage upload process
const uploadMiddleware = multer({
    fileFilter,
    storage: memoryStorage, // Store in memory first to process the file
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
}).single('artImage');

// Function to upload a file to S3 from buffer
const uploadBufferToS3 = (buffer, key, mimetype) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimetype
        };
        
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading to S3:', err);
                return reject(err);
            }
            resolve(data);
        });
    });
};

// Custom middleware to replace multerS3
const uploadToS3 = (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ message: err.message });
        }
        
        // If no file was uploaded, continue
        if (!req.file) {
            return next();
        }
        
        try {
            // Generate a unique filename
            const userId = req.user ? req.user.id : 'anonymous';
            const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
            const key = `art-uploads/${userId}-${Date.now().toString()}-${sanitizedFilename}`;
            
            console.log('Preparing to upload to S3 with key:', key);
            
            // Upload to S3
            const result = await uploadBufferToS3(
                req.file.buffer,
                key,
                req.file.mimetype
            );
            
            // Update the req.file object to match multerS3 structure
            req.file.key = key;
            req.file.location = result.Location;
            
            next();
        } catch (error) {
            console.error('Error in uploadToS3 middleware:', error);
            res.status(500).json({ message: 'Error uploading file to S3' });
        }
    });
};

// Function to generate a public URL for the uploaded file
const getPublicUrl = (key) => {
    if (!key) return null;
    
    try {
        // Generate a presigned URL that will work even with CORS restrictions
        const signedUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Expires: 60 * 60 * 24 * 7 // URL expires in 7 days
        });
        
        console.log('Generated signed URL for key:', key, '=>', signedUrl);
        return signedUrl;
    } catch (error) {
        console.error('Error generating public URL:', error);
        // Fallback to standard URL if presigned URL fails
        const url = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET_NAME}/${key}`;
        console.log('Falling back to standard URL:', url);
        return url;
    }
};

module.exports = { 
    uploadToS3, 
    getPublicUrl,
    s3 
};