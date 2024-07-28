

// models/CalendarEvent.js
const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  time: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: ['holiday', 'weekend', 'lecture', 'party'],
    required: true
  },
  space_id: {
    type: String,
    required: true
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  roomDevices: [{
    type: String,
    //ref: 'Device',
    required: true
  }],
  roomDevicesID: [{
    type: String,
    //ref: 'Device',
    required: true
  }],
  roomName: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  room_id: {
    type: String,
    required: true
  },
    repeatCount: {
      type: Number,
      default: 0, // 0 means no repetition
    },
    raspberryPiIP: {
      type: String,
      required: true
    }, 
});

// Update the updatedAt field before saving
calendarEventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;
