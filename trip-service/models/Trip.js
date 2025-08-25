const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,              // Will store as timestamp (JS Date)
    required: true
  },
  endDate: {
    type: Date,              // Will store as timestamp
    required: true
  },
  schedules: {
    type: Map,               // Key-value pairs (e.g., meetupTime: Date)
    of: Date                 // Each value in the map is a Date/timestamp
  },
  places: [
    {
      type: String,
      trim: true
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  peoples: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { 
        type: String, 
        enum: ['admin', 'member', 'guest'], // Enum for roles
        required: true 
      },
      status: { 
        type: String, 
        enum: ['accept', 'decline', 'tentative'],
        default: 'tentative',
        required: true
      }
    }
  ]
},
{
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
