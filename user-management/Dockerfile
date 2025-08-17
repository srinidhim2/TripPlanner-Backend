# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Environment variables
ENV USER_SERVER_PORT=3003
ENV USER_DB_URL=mongodb://mongo:27017/user_management
ENV UPLOADS_DIR=uploads/profilephoto
ENV JWT_SECRET = 123
# Expose port (from .env or default 3000)
EXPOSE 3003

# Start the service
CMD ["node", "server.js"]