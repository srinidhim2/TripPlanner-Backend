# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for better cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the source code
COPY . .

# Expose the port your app listens on
EXPOSE 3004

# Use environment variables from Docker environment or docker-compose
ENV NOTIFICATION_DB_URL=mongodb://mongo:27017/user_management
ENV FRIEND_REQUEST_TOPIC=friend-request
ENV NOTIFICATION_SERVER_PORT=3004
ENV LOG_LEVEL=debug
ENV USER_SERVICE_URL=http://user-service:3003
# Start your app
CMD ["node", "server.js"]