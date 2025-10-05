const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], required: true, default: 'pending' },
  completedOn: { type: Date },
  targetTime: { type: Date, required: true }
}, { _id: false });

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  schedules: [scheduleSchema],
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
        enum: ['admin', 'member', 'guest'],
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
