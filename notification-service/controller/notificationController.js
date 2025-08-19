// const mongoose = require('mongoose');
// const Notification = require('./models/Notification'); // Update path as needed
// Initialize Kafka consumer
require('dotenv').config();
const { runConsumer } = require('../utils/kafkaConsumer');

runConsumer(process.env.FRIEND_REQUEST_TOPIC, async (event) => {
  // Save event to DB, emit websocket, etc.
  console.log('Received event:', event);
});
