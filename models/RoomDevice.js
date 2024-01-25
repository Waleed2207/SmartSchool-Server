const mongoose = require('mongoose');

const roomDeviceSchema = new mongoose.Schema({
  id: {
    type: String.prototype,
    required: true
  },
  room_id: {
    type: String,
    required: true,
  }, 
  device_id: {
    type: String,
    required: true,
  }, 
  device_name: {
    type: String,
    required: true,
  }, 
  state: {
    type: String,
    required: true,
  }, 
});

const RoomDevice = mongoose.model('rooms-devices', roomDeviceSchema);

module.exports = RoomDevice;
