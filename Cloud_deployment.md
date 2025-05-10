# Cloud Deployment Guide: Digital Art Showcase (YOUR_NAME)

This guide details the steps to deploy the two-component (Frontend on Elastic Beanstalk, Backend on EC2 with Docker) Digital Art Showcase application to AWS.

**Your Name/Group Name:** `YOUR_NAME_HERE` (Remember to include this in resource names!)

**Prerequisites:**
1.  An AWS Account.
2.  AWS CLI installed and configured (or use the AWS Management Console).
3.  Docker installed locally (for building and pushing the backend image).
4.  Git installed.
5.  Project code cloned from your repository.

## Phase 1: Backend Deployment (Docker on EC2)

### Step 1: IAM Roles and Policies

**1.1. Create IAM Policy for EC2 S3 and CloudWatch Access (`EC2ArtAppPolicy-YourName`)**
   *   Go to IAM -> Policies -> Create policy.
   *   Select the JSON tab and paste the following (replace `your-unique-s3-bucket-name-yourname`):
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                     "s3:GetObject",
                     "s3:PutObject",
                     "s3:PutObjectAcl",
                     "s3:DeleteObject"
                 ],
                 "Resource": "arn:aws:s3:::your-unique-s3-bucket-name-yourname/*"
             },
             {
                 "Effect": "Allow",
                 "Action": "s3:ListBucket",
                 "Resource": "arn:aws:s3:::your-unique-s3-bucket-name-yourname"
             },
             {
                 "Effect": "Allow",
                 "Action": [
                     "logs:CreateLogGroup",
                     "logs:CreateLogStream",
                     "logs:PutLogEvents",
                     "logs:DescribeLogStreams"
                 ],
                 "Resource": "arn:aws:logs:*:*:*"
             }
         ]
     }
     ```
   *   Name it `EC2ArtAppPolicy-YourName`.
   *   *Screenshot: IAM Policy JSON and creation summary.*

**1.2. Create IAM Role for EC2 (`EC2ArtAppRole-YourName`)**
   *   Go to IAM -> Roles -> Create role.
   *   Trusted entity type: AWS service.
   *   Use case: EC2.
   *   Attach the `EC2ArtAppPolicy-YourName` policy created above.
   *   Optionally, attach `AmazonSSMManagedInstanceCore` for Systems Manager access (good practice).
   *   Name it `EC2ArtAppRole-YourName`.
   *   *Screenshot: IAM Role creation summary showing attached policies.*

### Step 2: Setup S3 Bucket

   *   Go to S3 -> Create bucket.
   *   Bucket name: `your-unique-s3-bucket-name-yourname` (must be globally unique, add your name).
   *   Region: Choose your preferred region.
   *   Block Public Access settings:
        *  For `public-read` ACLs from `multer-s3`: Uncheck "Block public access to buckets and objects granted through new access control lists (ACLs)" and "Block public access to buckets and objects granted through any access control lists (ACLs)". Acknowledge the warning.
        *  Alternatively, keep all public access blocked and serve images via CloudFront or presigned URLs (more secure, but more complex for MVP). For this project, public-read ACL is simpler.
   *   *Screenshot: S3 Bucket settings, especially permissions/public access.*

   **Bucket Policy (Optional, if you want to restrict further):**
   If you want to make objects public by default or enforce certain conditions, you can add a bucket policy. For `public-read` ACLs via `multer-s3`, this might not be strictly necessary if the object ACLs are set correctly on upload.
   Example for public read on a specific folder:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadForArtUploadsYourName",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::your-unique-s3-bucket-name-yourname/art-uploads-yourname/*"
           }
       ]
   }
   ```
   * *Screenshot: S3 Bucket Policy if used.*

### Step 3: Setup Amazon RDS (PostgreSQL)

* Go to RDS -> Create database.
* Choose "Standard Create".
* Engine options: PostgreSQL.
* Templates: Free tier (or Dev/Test for more options if budget allows).
* DB instance identifier: art-app-db-yourname.
* Master username: yourdbuser (or keep postgres).
* Master password: Set a strong password.
* DB instance class: db.t3.micro (or other free tier eligible).
* Storage: 20 GiB, General Purpose SSD (gp2).
* Connectivity:
  * VPC: Choose your default VPC or a custom one.
  * Public access: No (for security, EC2 will access it privately).
  * VPC security group: Create new. Name it rds-sg-yourname.
* Database authentication: Password authentication.
* Additional configuration:
  * Initial database name: artdb_yourname.
* Create database.
* *Screenshot: RDS creation summary, connectivity details.*

**Configure RDS Security Group (rds-sg-yourname):**
* Once created, go to its details -> Connectivity & security tab. Click on the VPC security group.
* Edit inbound rules:
  * Add rule: Type: PostgreSQL, Protocol: TCP, Port range: 5432.
  * Source: Custom. Start typing the ID of the security group you will create for your EC2 instance (e.g., ec2-backend-sg-yourname). You'll create this SG in the EC2 launch step. (Alternatively, allow from your VPC's CIDR range, but specific SG is better).
* *Screenshot: RDS Security Group inbound rules.*

### Step 4: Dockerize and Push Backend to ECR (Elastic Container Registry)

**4.1. Create ECR Repository**
* Go to ECR -> Create repository.
* Visibility: Private.
* Repository name: art-app-backend-yourname.
* Leave other settings as default. Create repository.
* *Screenshot: ECR repository created.*
* Click on the repository and then "View push commands". Follow these for your OS.

**4.2. Build and Push Docker Image**
* Navigate to your backend directory.
* Follow the ECR push commands. It will be something like:
  ```bash
  # 1. Authenticate Docker to your ECR registry
  aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-aws-account-id.dkr.ecr.your-region.amazonaws.com
  
  # 2. Build your Docker image
  docker build -t art-app-backend-yourname .  # The dot means current directory where Dockerfile is
  
  # 3. Tag your image
  docker tag art-app-backend-yourname:latest your-aws-account-id.dkr.ecr.your-region.amazonaws.com/art-app-backend-yourname:latest
  
  # 4. Push the image to ECR
  docker push your-aws-account-id.dkr.ecr.your-region.amazonaws.com/art-app-backend-yourname:latest
  ```
* *Screenshot: Terminal output of successful docker push to ECR.*

### Step 5: Launch EC2 Instance for Backend

* Go to EC2 -> Launch instance.
* Name: art-backend-ec2-yourname.
* Application and OS Images (AMI): Amazon Linux 2 AMI (HVM) - SSD Volume Type (or Amazon Linux 2023). Free tier eligible.
* Instance type: t2.micro (Free tier eligible).
* Key pair (login): Create a new key pair (art-app-key-yourname.pem) or use an existing one. Download and save the .pem file securely.
* Network settings:
  * VPC: Your default VPC (same as RDS).
  * Subnet: Choose a public subnet (if you plan to assign a public IP directly for testing or use an ALB later).
  * Auto-assign public IP: Enable (for initial setup/testing, or if not using an ALB).
* Firewall (security groups):
  * Create security group.
  * Name: ec2-backend-sg-yourname.
  * Description: "SG for Art App Backend EC2".
  * Inbound rules:
    * Type: SSH, Port: 22, Source: My IP (for your access).
    * Type: Custom TCP, Port: 3001 (your backend app's port), Source: 0.0.0.0/0 (for now, will be refined if using ALB; or restrict to Elastic Beanstalk SG later).
* Advanced details:
  * IAM instance profile: Select the EC2ArtAppRole-YourName created earlier.
  * User data (to install Docker and run container):
    ```bash
    #!/bin/bash
    yum update -y
    amazon-linux-extras install docker -y # For Amazon Linux 2
    # For Amazon Linux 2023: sudo dnf install docker -y
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Login to ECR (replace with your region and account ID)
    aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-aws-account-id.dkr.ecr.your-region.amazonaws.com
    
    # Pull and Run Docker container (replace with your ECR URI and S3 bucket name)
    # Pass RDS details as environment variables.
    # Get RDS endpoint, user, pass, db_name from RDS console.
    docker run -d -p 3001:3001 \
      -e PORT=3001 \
      -e NODE_ENV=production \
      -e JWT_SECRET='YOUR_VERY_SECRET_JWT_KEY_YOURNAME_FROM_DOTENV' \
      -e RDS_HOSTNAME='your-rds-endpoint.your-region.rds.amazonaws.com' \
      -e RDS_PORT='5432' \
      -e RDS_DB_NAME='artdb_yourname' \
      -e RDS_USERNAME='yourdbuser' \
      -e RDS_PASSWORD='yourdbpassword' \
      -e S3_BUCKET_NAME='your-unique-s3-bucket-name-yourname' \
      -e AWS_REGION='your-region' \
      --log-driver=awslogs \
      --log-opt awslogs-group=ArtAppBackendLogs-YourName \
      --log-opt awslogs-region=your-region \
      --log-opt awslogs-create-group=true \
      your-aws-account-id.dkr.ecr.your-region.amazonaws.com/art-app-backend-yourname:latest
    ```
    **Important:** Replace placeholders in User Data script!
* Launch instance.
* *Screenshots: EC2 launch configuration summary, Security Group rules, IAM role attached, User Data script.*

### Step 6: Verify Backend

* Once the EC2 instance is running, find its Public IPv4 address.
* Try accessing http://<EC2_PUBLIC_IP>:3001/ in your browser. You should see "API is running... Deployed by YOUR_NAME".
* Check CloudWatch Logs for ArtAppBackendLogs-YourName group for any errors.
* The RDS Security group (rds-sg-yourname) should now allow inbound traffic from ec2-backend-sg-yourname on port 5432. If you used the EC2 instance's private IP or VPC CIDR, verify that.

## Phase 2: Frontend Deployment (Elastic Beanstalk)

### Step 1: Prepare Frontend for Deployment

* In frontend/package.json, ensure you have a build script:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```
* Create a .env.production file in your frontend/ directory (or configure EB environment variables):
  ```
  VITE_API_BASE_URL=http://<YOUR_EC2_PUBLIC_IP>:3001/api
  ```
  (Replace <YOUR_EC2_PUBLIC_IP> with the actual public IP of your backend EC2 instance).
* Build the frontend: `npm run build` in the frontend/ directory. This creates a dist folder.

### Step 2: Create Elastic Beanstalk Application and Environment

* Go to Elastic Beanstalk -> Create application.
* Application name: ArtShowcaseApp-YourName.
* (Optional) Add tags.
* Create.
* Now, from the application page, "Create environment".
* Environment tier: Web server environment.
* Platform: Managed platform.
* Platform: Node.js (EB will serve the static files; Node.js platform is common for this).
* Platform branch and version: Choose a recent Node.js LTS version.
* Application code: Upload your code.
  * Source code origin: Local file.
  * Create a ZIP file containing only the contents of your frontend/dist/ folder. (e.g., `cd frontend/dist && zip -r ../art-frontend-yourname.zip ./*`)
  * OR, for a Node.js platform, you can zip the entire frontend project, and EB can run npm run build. For simpler static hosting, just zip the dist contents. Let's assume we zip dist contents directly for simplicity.
  * Alternatively, if using the Node.js platform type, you can create a Procfile in your frontend root: `web: npx serve -s dist -l 8080` (install serve as a dev dependency: `npm i -D serve`). Then zip the whole frontend directory (excluding node_modules).
* Click "Configure more options" (Important!).
  * Software:
    * Environment properties:
      * VITE_API_BASE_URL = http://<YOUR_EC2_PUBLIC_IP>:3001/api (if not baked into build via .env.production).
      * PORT = 8080 (Elastic Beanstalk expects the app to listen on this port by default, or it configures Nginx to proxy to it).
  * Capacity:
    * Environment type: Single instance (for Free Tier).
  * Security:
    * IAM instance profile: EB creates one by default (aws-elasticbeanstalk-ec2-role). This is fine.
* Click "Create environment". This will take several minutes.
* *Screenshots: EB application creation, environment configuration (platform, code upload, environment properties).*

### Step 3: Configure Elastic Beanstalk Security Group

* Once the EB environment is running, find its URL (e.g., artshowcase-yourname.eba-xyz.region.elasticbeanstalk.com).
* The default EB security group allows HTTP (port 80) from anywhere. This is usually okay for the frontend.
* If you want to restrict backend access to ONLY your Elastic Beanstalk frontend:
  * Go to EC2 -> Security Groups. Find the security group associated with your Elastic Beanstalk environment (its name will contain the EB environment ID).
  * Copy the ID of this EB security group.
  * Go to your backend EC2 instance's security group (ec2-backend-sg-yourname).
  * Edit inbound rules. Change the source for port 3001 from 0.0.0.0/0 to the ID of the EB security group. This is more secure.
* *Screenshot: EB Security Group and/or Backend EC2 SG updated for EB access.*

### Step 4: Verify Frontend

* Access your Elastic Beanstalk URL.
* Test registration, login, art upload, and viewing.
* Check browser developer console for any errors (especially CORS or API connection issues).

## Phase 3: Security & IAM Review (Summary)

### IAM Roles:
* EC2ArtAppRole-YourName: Attached to backend EC2. Grants S3 and CloudWatch Logs access via EC2ArtAppPolicy-YourName.
* aws-elasticbeanstalk-ec2-role: Auto-created by EB for its instances.

### IAM Policies:
* EC2ArtAppPolicy-YourName: Custom policy for EC2 S3/CloudWatch.

### Security Groups:
* rds-sg-yourname: For RDS. Allows PostgreSQL (5432) from ec2-backend-sg-yourname.
* ec2-backend-sg-yourname: For backend EC2.
  * Allows SSH (22) from Your IP.
  * Allows Custom TCP (3001) from EB's security group (or 0.0.0.0/0 if simpler setup).
* Elastic Beanstalk SG (auto-created): For frontend. Allows HTTP (80) from 0.0.0.0/0.

### S3 Bucket Policy: 
Configured for public read on art-uploads-yourname/ or relies on public-read ACLs set by multer-s3.

### Least Privilege:
* EC2 role only has permissions needed for S3 (specific bucket) and Logs.
* RDS SG only allows traffic from the backend EC2 SG.
* Backend EC2 SG ideally only allows traffic from EB SG on the app port.

*Screenshots for all IAM roles, policies, and security group configurations are required in your PDF submission.*

## Phase 4: Submission Requirements

* GitHub Repo Link: (Your forked/original repo)
* README with Deployment Guide: (This file, essentially)
* Live Demo URLs:
  * Frontend (Elastic Beanstalk URL): http://your-eb-env-url.elasticbeanstalk.com
  * Backend (EC2 Public IP/DNS + Port): http://<YOUR_EC2_PUBLIC_IP>:3001/api (Base URL)
* PDF Document:
  * Architecture Diagram (draw one showing User -> EB -> EC2 -> RDS/S3).
  * IAM policy Screenshots (JSON and summary).
  * IAM role Screenshots (summary showing attached policies).
  * Screenshots of AWS deployment and configurations (S3 bucket, RDS instance, EC2 instance, EB environment, Security Groups).

## Bonus: Route 53 Custom Domain

* Register a Domain (or use an existing one): Use Route 53 or any registrar.
* Create Hosted Zone in Route 53: If domain not with AWS, create a hosted zone for your domain. Note the NS records.
* Update Name Servers: At your domain registrar, update NS records to point to the AWS NS records from your Route 53 hosted zone.
* Frontend (Elastic Beanstalk):
  * It's easiest if your EB environment has a Load Balancer (even a Classic one on a single instance environment).
  * In Route 53, create an 'A' record.
  * Alias: Yes.
  * Route traffic to: Alias to Elastic Beanstalk environment. Select your region and EB environment.
  * If your EB environment is not load-balanced (older configurations or specific choices), you'd get a CNAME for the environment. You'd create a CNAME record in Route 53 pointing to the EB environment's URL (e.g., myapp.elasticbeanstalk.com).
* Backend (EC2 - Optional for direct access, usually accessed via frontend):
  * If you want a custom domain for the API:
    * Assign an Elastic IP to your EC2 instance.
    * In Route 53, create an 'A' record (e.g., api.yourdomain.com) pointing to the Elastic IP.
* HTTPS with ACM:
  * Request a public certificate from AWS Certificate Manager (ACM) for your domain(s) (e.g., yourdomain.com, www.yourdomain.com, api.yourdomain.com).
  * Validate it (DNS or Email).
  * If using an Application Load Balancer (ALB) for either frontend (via EB) or backend (manually created), you can associate this ACM certificate with the ALB listener for HTTPS.

*This guide provides a basic path. Production deployments involve more considerations like VPC design, load balancing for backend, CI/CD, robust monitoring, and more granular security.*