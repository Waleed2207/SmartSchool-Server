const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
  name: { type: String, required: true },
  startTime: { type: Date, required: true }, // Ensure this is defined as Date
  endTime: { type: Date, required: true }, // Ensure this is defined as Date
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: String, required: true }
});

module.exports = mongoose.model('Activity', ActivitySchema);