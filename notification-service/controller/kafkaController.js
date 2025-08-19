require('dotenv').config();
const { runConsumer } = require('../utils/kafkaConsumer');
const Notification = require('../models/Notification');

console.log('Starting Notification Service...');
console.log('process.env.NOTIFICATION_DB_URL:', process.env.NOTIFICATION_DB_URL);
runConsumer(process.env.FRIEND_REQUEST_TOPIC, async (event) => {
  // Save event to DB, emit websocket, etc.
  console.log('Received event:', event);
  try {
    // Create notification from event data
    const notification = new Notification({
      userId: event.friendRequest.partyB,     // The receiver of friend request
      type: event.category,     // e.g. "FRIEND-REQUEST"
      data: event.friendRequest,               // The friend request object with details
    });
    const notificationResult = await notification.save();
    if (!notificationResult) {
      throw new Error('Failed to save notification');
    }
    console.log('Notification saved:', notification);
  } catch (error) {
    console.error('Failed to save notification:', error);
  }
});