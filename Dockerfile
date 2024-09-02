# Use the official Node.js 20 image as a base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port that your app and metrics server will run on
EXPOSE 3000

# Start the server
CMD ["node", "metrics.js"]
