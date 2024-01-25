const mongoose = require('mongoose');

const functionSchema = new mongoose.Schema({
  function: {
    type: String,
    required: true
  },
  isActivated: {
    type: Boolean
  }
});

const Function = mongoose.model('Functions', functionSchema);

module.exports = Function;
