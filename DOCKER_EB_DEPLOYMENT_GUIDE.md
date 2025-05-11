# MetroArt Deployment with Docker and Elastic Beanstalk

This guide provides step-by-step instructions for deploying the MetroArt application with Docker for the backend (on EC2) and Elastic Beanstalk for the frontend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment with Docker on EC2](#backend-deployment-with-docker-on-ec2)
3. [Frontend Deployment on Elastic Beanstalk](#frontend-deployment-on-elastic-beanstalk)
4. [AWS Services Configuration](#aws-services-configuration)
5. [Connecting the Components](#connecting-the-components)

## Prerequisites

Before proceeding, ensure you have:

- AWS account with access to EC2, Elastic Beanstalk, RDS, and S3
- Docker installed on your local machine
- AWS CLI installed and configured
- Node.js and npm installed
- Git repository with your MetroArt code

## Backend Deployment with Docker on EC2

### 1. Create a Dockerfile for the Backend

In your backend directory, create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/server.js"]
```

### 2. Create a .dockerignore File

```
node_modules
npm-debug.log
.env
.git
.gitignore
```

### 3. Build and Test Docker Image Locally

```bash
# Build the Docker image
docker build -t metroart-backend .

# Run the container locally to test
docker run -p 3000:3000 --env-file .env -d --name metroart-backend-container metroart-backend
```

### 4. Install AWS ECR CLI and Authenticate

```bash
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com
```

### 5. Create ECR Repository

```bash
aws ecr create-repository --repository-name metroart-backend --region ap-southeast-2
```

### 6. Tag and Push the Docker Image

```bash
# Tag the image
docker tag metroart-backend:latest ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/metroart-backend:latest

# Push to ECR
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/metroart-backend:latest
```

### 7. Launch EC2 Instance and Install Docker

```bash
# Launch EC2 instance (t2.micro for free tier)
aws ec2 run-instances \
  --image-id ami-0742b4e673072066f \
  --count 1 \
  --instance-type t2.micro \
  --key-name your-key-pair \
  --security-group-ids YOUR_SECURITY_GROUP_ID \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=metroart-docker}]'
```

Connect to your EC2 instance:

```bash
ssh -i your-key-pair.pem ec2-user@YOUR_EC2_PUBLIC_DNS
```

Install Docker on EC2:

```bash
# Update packages
sudo yum update -y

# Install Docker
sudo amazon-linux-extras install docker -y
sudo service docker start
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Log out and log back in to apply changes
exit
# Reconnect to the instance
ssh -i your-key-pair.pem ec2-user@YOUR_EC2_PUBLIC_DNS
```

### 8. Configure AWS Credentials on EC2

```bash
mkdir -p ~/.aws
touch ~/.aws/credentials
```

Add your AWS credentials:

```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

### 9. Pull and Run the Docker Image on EC2

```bash
# Authenticate with ECR
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com

# Pull the image
docker pull ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/metroart-backend:latest

# Create environment file
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgres://metroartadmin:YOUR_SECURE_PASSWORD@YOUR_RDS_ENDPOINT:5432/metroart
PORT=3000
AWS_REGION=ap-southeast-2
S3_BUCKET_NAME=metro-art
EOF

# Run the container
docker run --restart always -p 80:3000 --env-file .env -d --name metroart-backend-container ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/metroart-backend:latest
```

### 10. Setup Automatic Updates (Optional)

Create a deployment script:

```bash
cat > update-container.sh << EOF
#!/bin/bash
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com
docker pull ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/metroart-backend:latest
docker stop metroart-backend-container
docker rm metroart-backend-container
docker run --restart always -p 80:3000 --env-file .env -d --name metroart-backend-container ACCOUNT_ID.dkr.ecr.ap-southeast-2.amazonaws.com/metroart-backend:latest
EOF

chmod +x update-container.sh
```

## Frontend Deployment on Elastic Beanstalk

### 1. Prepare Frontend for Elastic Beanstalk

Create a configuration file for Elastic Beanstalk:

```bash
mkdir -p frontend/.ebextensions
```

Create `frontend/.ebextensions/staticfiles.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:staticfiles:
    /: dist/
```

### 2. Update package.json for Elastic Beanstalk

Add the following to your frontend `package.json`:

```json
{
  "scripts": {
    "start": "serve -s dist -l 8080",
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "serve": "^14.0.0"
  }
}
```

Install the serve package:

```bash
cd frontend
npm install serve --save
```

### 3. Configure Environment Variables

Create `frontend/.env.production`:

```
VITE_API_BASE_URL=http://YOUR_EC2_PUBLIC_IP/api
```

### 4. Build the Frontend

```bash
cd frontend
npm run build
```

### 5. Initialize Elastic Beanstalk

```bash
cd frontend
eb init metroart-frontend --platform node.js --region ap-southeast-2
```

### 6. Create and Deploy to Elastic Beanstalk Environment

```bash
eb create metroart-frontend-prod --instance-type t2.micro
```

## AWS Services Configuration

### 1. Database Setup (RDS)

```bash
aws rds create-db-instance \
  --db-instance-identifier metroart-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username metroartadmin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids YOUR_SECURITY_GROUP_ID \
  --db-name metroart
```

### 2. S3 Bucket for Image Storage

```bash
# Create S3 bucket for image storage
aws s3 mb s3://metro-art

# Configure CORS
cat > cors-config.json << EOF
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
EOF

aws s3api put-bucket-cors --bucket metro-art --cors-configuration file://cors-config.json
```

## Connecting the Components

### 1. Update Security Groups

Update EC2 security group to allow traffic from Elastic Beanstalk:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_EC2_SECURITY_GROUP_ID \
  --protocol tcp \
  --port 80 \
  --source-group YOUR_EB_SECURITY_GROUP_ID
```

Update RDS security group to allow traffic from EC2:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_RDS_SECURITY_GROUP_ID \
  --protocol tcp \
  --port 5432 \
  --source-group YOUR_EC2_SECURITY_GROUP_ID
```

### 2. Update Frontend Configuration

If the backend URL changes, update the environment variable and redeploy:

```bash
cd frontend
echo "VITE_API_BASE_URL=http://YOUR_NEW_EC2_PUBLIC_IP/api" > .env.production
npm run build
eb deploy
```

### 3. Configure DNS (Optional)

If you have a domain name, you can set up DNS records to point to your services:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "api.yourdomain.com",
          "Type": "A",
          "TTL": 300,
          "ResourceRecords": [{ "Value": "YOUR_EC2_PUBLIC_IP" }]
        }
      },
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "app.yourdomain.com",
          "Type": "CNAME",
          "TTL": 300,
          "ResourceRecords": [{ "Value": "YOUR_EB_URL" }]
        }
      }
    ]
  }'
```

## Troubleshooting

### Docker Container Issues

Check container logs:

```bash
docker logs metroart-backend-container
```

### Elastic Beanstalk Issues

Check logs:

```bash
eb logs
```

Health status:

```bash
eb health
```

## Maintenance and Updates

### Updating Backend

1. Make changes to the backend code
2. Build a new Docker image
3. Push to ECR
4. On the EC2 instance, run the update script:

```bash
./update-container.sh
```

### Updating Frontend

1. Make changes to the frontend code
2. Build the frontend
3. Deploy to Elastic Beanstalk:

```bash
cd frontend
npm run build
eb deploy
```

## Conclusion

You now have a MetroArt application with:
- Dockerized backend running on EC2
- Frontend running on Elastic Beanstalk
- Backend connected to AWS RDS and S3
- Frontend communicating with the backend

This setup leverages AWS free tier while providing a robust deployment architecture for your application. 