const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
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

const uploadToS3 = multer({
    fileFilter,
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Add user identifier or unique prefix to avoid name collisions
            const userId = req.user ? req.user.id : 'anonymous';
            // Sanitize the filename to remove any special characters
            const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
            const filename = `art-uploads/${userId}-${Date.now().toString()}-${sanitizedFilename}`;
            console.log('Uploading file to S3 with key:', filename);
            cb(null, filename);
        }
    }),
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
});

// Function to generate a public URL for the uploaded file
const getPublicUrl = (key) => {
    if (!key) return null;
    
    try {
        // Standard S3 URL format: https://{bucket-name}.s3.{region}.amazonaws.com/{key}
        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        
        console.log('Generated URL for key:', key, '=>', url);
        return url;
    } catch (error) {
        console.error('Error generating public URL:', error);
        return null;
    }
};

module.exports = { 
    uploadToS3, 
    getPublicUrl,
    s3 
};