const mongoose = require('mongoose');
const { Schema } = mongoose;

const friendRequestSchema = new Schema({
  partyA: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // requester
  partyB: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // receiver
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    required: true
  }
}, { timestamps: true });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
