const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }
});

module.exports = mongoose.model('Activity', ActivitySchema);
