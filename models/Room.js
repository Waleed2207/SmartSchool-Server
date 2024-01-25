const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
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

const Room = mongoose.model("rooms", roomSchema);

module.exports = Room;
