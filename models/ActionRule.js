const mongoose = require('mongoose');

const ActionRuleSchema = new mongoose.Schema({
  description: String,
  condition: String,
  action: String,
  // You can add other fields as necessary
});

const ActionRule = mongoose.model('Action-Rules', ActionRuleSchema);

module.exports = ActionRule;
