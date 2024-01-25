const mongoose = require('mongoose');

const SensorValueSchema = new mongoose.Schema({
  value: String,
  sensor_type: String,
  timestamp: { type: Date, default: Date.now }
});

// Add index on timestamp field
SensorValueSchema.index({ timestamp: 1 });

const SensorValue = mongoose.model('sensor_values', SensorValueSchema);

module.exports = SensorValue;
