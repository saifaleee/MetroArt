const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Configure AWS SDK (Done via IAM Role on EC2, but needed for local dev if keys are set)
if (process.env.AWS_ACCESS_KEY_ID) {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });
}

const s3 = new AWS.S3();

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
        acl: 'public-read', // Or private if you want to serve via signed URLs
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Add user identifier or unique prefix to avoid name collisions
            const userId = req.user ? req.user.id : 'anonymous';
            cb(null, `art-uploads-yourname/${userId}-${Date.now().toString()}-${file.originalname}`);
        }
    }),
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
});

module.exports = { uploadToS3 };