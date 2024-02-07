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
  action: String,
});

const Rule = mongoose.model('rules', ruleSchema);

module.exports = Rule;
