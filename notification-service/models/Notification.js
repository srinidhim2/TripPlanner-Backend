const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: String, // The user receiving the notification
  type: String,   // e.g., 'FRIEND_REQUEST'
  data: Object,   // Any additional data (e.g., who sent the request)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
