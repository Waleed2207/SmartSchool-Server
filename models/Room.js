const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  space_id: {
    type: String,
    required: true,
  },
  name_space: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "",
  },
  devices: {
    type: [String],
    default: [],
  },
  sensors: {
    type: Map,
    of: String,
    default: {},
  },
  motionDetected: {
    type: Boolean,
    default: false,
  },
});

const Room = mongoose.model("Room", roomSchema); // Note the singular 'Room'

module.exports = Room;
