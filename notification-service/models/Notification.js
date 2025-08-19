const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',    // Reference to the User model
    required: true,
  },
  type: String,   // e.g., 'FRIEND_REQUEST'
  data: Object,   // Any additional data (e.g., who sent the request)
  createdAt: { type: Date, default: Date.now },
  read: {
    type: Boolean,
    default: false, // Whether the user has seen/read the notification
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
