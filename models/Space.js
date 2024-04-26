const mongoose = require("mongoose");

const spaceSchema = new mongoose.Schema({
  space_id: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ["SmartSchool", "SmartHome"],
  },
  icon: {
    type: String,
    default: "",
  },
  rasp_ip: {
    type: String,
    unique: true,
    required: true
  }
});

const Space = mongoose.model("spaces", spaceSchema);
module.exports = Space;
