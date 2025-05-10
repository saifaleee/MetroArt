# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app-yourname # Add your name

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define environment variable (can be overridden)
ENV NODE_ENV=production
# Add other ENV vars that are NOT secrets here, or pass them during `docker run` or ECS task definition
# e.g., ENV S3_BUCKET_NAME=your-unique-s3-bucket-name-yourname (better set in EC2 env)

# Run the app when the container launches
CMD [ "node", "src/server.js" ]