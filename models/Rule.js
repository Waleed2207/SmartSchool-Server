const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({

  description: String,
  condition: {
      variable: String,
      operator: String,
      value: Number
  },
  id: {
    type: String,
    required: true
  },
  space_id: {
    type: String,
    required: true
  },
  action: String,
  isStrict: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
});

const Rule = mongoose.model('rules', ruleSchema);

module.exports = Rule;
