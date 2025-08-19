require('dotenv').config();
const { runConsumer } = require('../utils/kafkaConsumer');

console.log('Starting Notification Service...');
console.log('process.env.NOTIFICATION_DB_URL:', process.env.NOTIFICATION_DB_URL);
runConsumer(process.env.FRIEND_REQUEST_TOPIC, async (event) => {
  // Save event to DB, emit websocket, etc.
  console.log('Received event:', event);
});