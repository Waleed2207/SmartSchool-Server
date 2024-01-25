const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true
  },
  state: {
    type: String,
  },
  name: {
    type: String,
    default: true
  },
  threshold: {
    type: Number,
    default: 0.6
  },
  mode: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  icon: {
    type: Object,
    default: {
      name: 'default',
      color: 'green'
    }
  }
});

const Device = mongoose.model('devices', deviceSchema);

module.exports = Device;
