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
ENV TRIP_SERVER_PORT=3005
ENV TRIP_DB_URL=mongodb://mongo:27017/trip_management
# ENV UPLOADS_DIR=uploads/profilephoto
ENV JWT_SECRET=123
ENV TRIP_PLANNER_TOPIC=trip-planner
ENV USER_SERVICE_URL=http://user-service:3003
ENV LOG_LEVEL=debug

# ENV FRIEND_REQUEST_TOPIC=friend-request
# Expose port (from .env or default 3000)
EXPOSE 3005

# Start the service
CMD ["node", "server.js"]