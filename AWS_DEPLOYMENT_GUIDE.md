# MetroArt AWS Deployment Guide

This guide provides step-by-step instructions for deploying the MetroArt application to AWS cloud infrastructure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [Database Setup (RDS)](#database-setup-rds)
4. [S3 Bucket Configuration](#s3-bucket-configuration)
5. [Backend Deployment (EC2)](#backend-deployment-ec2)
6. [Frontend Deployment (S3 + CloudFront)](#frontend-deployment-s3--cloudfront)
7. [Domain and DNS Configuration](#domain-and-dns-configuration)
8. [Security Best Practices](#security-best-practices)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before proceeding, ensure you have:

- AWS account with administrative access
- AWS CLI installed and configured
- Node.js and npm installed
- Git repository with your MetroArt code
- Domain name (optional, but recommended)

## AWS Account Setup

1. **Create IAM User for Deployments**:

   ```bash
   aws iam create-user --user-name metroart-deployer
   aws iam attach-user-policy --user-name metroart-deployer --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
   aws iam attach-user-policy --user-name metroart-deployer --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess
   aws iam attach-user-policy --user-name metroart-deployer --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkFullAccess
   aws iam create-access-key --user-name metroart-deployer
   ```

   Note: Save the output access key and secret key for later use.

2. **Configure AWS CLI with the new credentials**:

   ```bash
   aws configure
   ```

## Database Setup (RDS)

1. **Create a PostgreSQL RDS instance**:

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

2. **Create Security Group for RDS**:

   ```bash
   aws ec2 create-security-group --group-name metroart-db-sg --description "MetroArt RDS security group"
   aws ec2 authorize-security-group-ingress --group-name metroart-db-sg --protocol tcp --port 5432 --cidr 0.0.0.0/0
   ```

3. **Get RDS Endpoint**:

   ```bash
   aws rds describe-db-instances --db-instance-identifier metroart-db --query "DBInstances[0].Endpoint.Address" --output text
   ```

## S3 Bucket Configuration

1. **Create S3 buckets for frontend and image storage**:

   ```bash
   # For frontend hosting
   aws s3 mb s3://metroart-frontend

   # For image storage
   aws s3 mb s3://metro-art
   ```

2. **Configure frontend bucket for website hosting**:

   ```bash
   aws s3 website s3://metroart-frontend --index-document index.html --error-document index.html
   ```

3. **Create bucket policy for frontend**:

   Create a file named `frontend-bucket-policy.json`:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::metroart-frontend/*"
       }
     ]
   }
   ```

   Apply the policy:

   ```bash
   aws s3api put-bucket-policy --bucket metroart-frontend --policy file://frontend-bucket-policy.json
   ```

4. **Configure CORS for image bucket**:

   Create a file named `image-bucket-cors.json`:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

   Apply the CORS configuration:

   ```bash
   aws s3api put-bucket-cors --bucket metro-art --cors-configuration file://image-bucket-cors.json
   ```

## Backend Deployment (EC2)

1. **Launch EC2 Instance**:

   ```bash
   aws ec2 run-instances \
     --image-id ami-0742b4e673072066f \
     --count 1 \
     --instance-type t2.micro \
     --key-name your-key-pair \
     --security-group-ids YOUR_SECURITY_GROUP_ID \
     --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=metroart-backend}]' \
     --query 'Instances[0].InstanceId' \
     --output text
   ```

2. **Create Security Group for EC2**:

   ```bash
   aws ec2 create-security-group --group-name metroart-backend-sg --description "MetroArt backend security group"
   aws ec2 authorize-security-group-ingress --group-name metroart-backend-sg --protocol tcp --port 22 --cidr YOUR_IP_ADDRESS/32
   aws ec2 authorize-security-group-ingress --group-name metroart-backend-sg --protocol tcp --port 80 --cidr 0.0.0.0/0
   aws ec2 authorize-security-group-ingress --group-name metroart-backend-sg --protocol tcp --port 443 --cidr 0.0.0.0/0
   ```

3. **Get Public DNS Name**:

   ```bash
   aws ec2 describe-instances \
     --instance-ids YOUR_INSTANCE_ID \
     --query 'Reservations[0].Instances[0].PublicDnsName' \
     --output text
   ```

4. **Connect to the EC2 instance**:

   ```bash
   ssh -i your-key-pair.pem ec2-user@YOUR_EC2_PUBLIC_DNS
   ```

5. **Install Node.js and Git**:

   ```bash
   # Update system packages
   sudo yum update -y
   
   # Install Node.js
   curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   
   # Install Git
   sudo yum install -y git
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

6. **Clone and configure your application**:

   ```bash
   git clone https://github.com/yourusername/metroart.git
   cd metroart/backend
   npm install
   ```

7. **Create environment configuration**:

   ```bash
   cat > .env << EOF
   NODE_ENV=production
   DATABASE_URL=postgres://metroartadmin:YOUR_SECURE_PASSWORD@YOUR_RDS_ENDPOINT:5432/metroart
   PORT=3000
   AWS_REGION=ap-southeast-2
   S3_BUCKET_NAME=metro-art
   EOF
   ```

8. **Install and configure Nginx as reverse proxy**:

   ```bash
   sudo yum install -y nginx
   
   # Configure Nginx
   sudo tee /etc/nginx/conf.d/metroart.conf > /dev/null << EOF
   server {
       listen 80;
       server_name _;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_cache_bypass \$http_upgrade;
       }
   }
   EOF
   
   # Start Nginx and enable on boot
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

9. **Setup PM2 for production**:

   ```bash
   # Start application with PM2
   pm2 start src/server.js --name "metroart-backend"
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on system boot
   pm2 startup
   # Run the command provided by the previous output
   ```

10. **Setup automatic deployments (optional)**:

    Create a deployment script in your project:

    ```bash
    cat > deploy.sh << EOF
    #!/bin/bash
    cd ~/metroart/backend
    git pull
    npm install
    pm2 restart metroart-backend
    EOF
    
    chmod +x deploy.sh
    ```

## Frontend Deployment (S3 + CloudFront)

1. **Update frontend environment variables**:

   Create `frontend/.env.production`:

   ```
   VITE_API_BASE_URL=https://YOUR_EB_URL/api
   ```

2. **Build the frontend**:

   ```bash
   cd frontend
   npm run build
   ```

3. **Upload build files to S3**:

   ```bash
   aws s3 sync dist/ s3://metroart-frontend/ --delete
   ```

4. **Create CloudFront distribution**:

   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name metroart-frontend.s3.amazonaws.com \
     --default-root-object index.html \
     --query "Distribution.DomainName" \
     --output text
   ```

5. **Configure CloudFront for SPA routing**:

   Create a file named `cloudfront-function.js`:

   ```javascript
   function handler(event) {
     var request = event.request;
     var uri = request.uri;
     
     // Check whether the URI is missing a file name.
     if (uri.endsWith('/')) {
       request.uri += 'index.html';
     } 
     // Check whether the URI is missing a file extension.
     else if (!uri.includes('.')) {
       request.uri = '/index.html';
     }
     
     return request;
   }
   ```

   Create and associate the function:

   ```bash
   aws cloudfront create-function \
     --name MetroArtSPARouter \
     --function-config Comment="SPA router for MetroArt",Runtime="cloudfront-js-1.0" \
     --function-code fileb://cloudfront-function.js

   aws cloudfront update-distribution \
     --id YOUR_DISTRIBUTION_ID \
     --function-associations Quantity=1,Items=[{EventType=viewer-request,FunctionARN="arn:aws:cloudfront::YOUR_ACCOUNT_ID:function/MetroArtSPARouter"}]
   ```

## Domain and DNS Configuration

1. **Register a domain with Route 53** (if you don't already have one):

   ```bash
   aws route53domains register-domain --domain-name yourdomain.com --admin-contact ... --tech-contact ... --registrant-contact ...
   ```

2. **Create a hosted zone**:

   ```bash
   aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)
   ```

3. **Create A records for API and frontend**:

   Create a JSON file named `route53-records.json`:

   ```json
   {
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
           "Name": "yourdomain.com",
           "Type": "A",
           "AliasTarget": {
             "HostedZoneId": "Z2FDTNDATAQYW2", 
             "DNSName": "YOUR_CLOUDFRONT_DOMAIN_NAME",
             "EvaluateTargetHealth": false
           }
         }
       }
     ]
   }
   ```

   Apply the changes:

   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id YOUR_HOSTED_ZONE_ID --change-batch file://route53-records.json
   ```

4. **Update environment variables with new domain**:

   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=https://api.yourdomain.com/api" > .env.production
   npm run build
   aws s3 sync dist/ s3://metroart-frontend/ --delete
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

## Security Best Practices

1. **Set up SSL certificates with AWS Certificate Manager**:

   ```bash
   aws acm request-certificate --domain-name yourdomain.com --validation-method DNS --subject-alternative-names *.yourdomain.com
   ```

2. **Configure AWS WAF for CloudFront**:

   ```bash
   aws wafv2 create-web-acl --name MetroArtWAF --scope CLOUDFRONT --default-action Allow={} \
     --rules ... \
     --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=MetroArtWAF
   ```

3. **Update IAM permissions to use least privilege principle**:

   Review and refine the IAM policies for the deployment user to include only necessary permissions.

4. **Enable AWS CloudTrail**:

   ```bash
   aws cloudtrail create-trail --name MetroArtTrail --s3-bucket-name YOUR_CLOUDTRAIL_BUCKET
   aws cloudtrail start-logging --name MetroArtTrail
   ```

## Monitoring and Maintenance

1. **Set up CloudWatch Alarms**:

   ```bash
   aws cloudwatch put-metric-alarm \
     --alarm-name MetroArt-API-HighCPU \
     --alarm-description "Alarm when CPU exceeds 80%" \
     --metric-name CPUUtilization \
     --namespace AWS/EC2 \
     --statistic Average \
     --period 300 \
     --threshold 80 \
     --comparison-operator GreaterThanThreshold \
     --dimensions Name=InstanceId,Value=YOUR_EC2_INSTANCE_ID \
     --evaluation-periods 2 \
     --alarm-actions arn:aws:sns:ap-southeast-2:YOUR_ACCOUNT_ID:MetroArt-Alerts
   ```

2. **Configure automatic database backups**:

   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier metroart-db \
     --backup-retention-period 7 \
     --preferred-backup-window "00:00-01:00" \
     --apply-immediately
   ```

3. **Set up scheduled tasks for maintenance**:

   ```bash
   # Create CloudWatch event rule for weekly maintenance
   aws events put-rule \
     --name MetroArt-Weekly-Maintenance \
     --schedule-expression "cron(0 0 ? * SUN *)" \
     --state ENABLED
   ```

4. **Implement CI/CD pipeline** (optional):

   - Set up GitHub Actions or AWS CodePipeline for automated deployments
   - Configure testing and validation before production deployments
   - Implement rollback procedures

## Conclusion

You've now successfully deployed the MetroArt application on AWS infrastructure. This setup provides a scalable, secure, and reliable environment for your application.

For ongoing maintenance:

- Regularly update dependencies and apply security patches
- Monitor CloudWatch metrics and logs
- Perform regular database backups
- Test the disaster recovery procedure

Should you need further assistance or have questions about specific aspects of the deployment, refer to the AWS documentation or contact your cloud administrator. 