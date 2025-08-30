FROM node:18-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for better cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the source code
COPY . .

EXPOSE 3006

ENV USER_SERVER=user-service
ENV USER_SERVICE_PORT=3003
ENV TRIP_SERVER=trip-service
ENV TRIP_SERVICE_PORT=3005
ENV NOTIFICATION_SERVER=notification-service
ENV NOTIFICATION_SERVICE_PORT=3004

CMD ["node", "server.js"]

