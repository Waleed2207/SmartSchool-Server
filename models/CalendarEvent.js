const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CalendarEventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  time: {
    type: Date,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  space_id: {
    type: String,
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  roomDevices: [{
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  }],
});

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
