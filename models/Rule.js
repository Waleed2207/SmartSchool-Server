const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  rule: {
    type: String,
    required: true
  },
  normalizedRule: {
    type: String,
    required: true
  },
  isStrict: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  id: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  relatedRule: {
    type: String,
    default: null
  },
  isUIOnly: {
    type: Boolean,
    defaulr: false
  }
});

const Rule = mongoose.model('rules', ruleSchema);

module.exports = Rule;
