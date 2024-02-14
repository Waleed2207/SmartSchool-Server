// const mongoose = require('mongoose');
const Rules = [
    {
      description: "Cooling the room", 
      condition: {
        variable: "temperature",
        operator: "is above",
        value: 20,
      },
      action: "Turn AC ON 20 DEGREES"
    },
    {
      description: "Heating the room", 
      condition: {
        variable: "temperature",
        operator: "is below",
        value: 10,
      },
      action: "Turn AC ON 35 DEGREES"
    },
    {
      description: "Turn on light", 
      condition: {
        variable: "temperature",
        operator: "is below",
        value: 10,
      },
      action: "Turn lights on "
    },
    //add the rule of turn lights
    
  ];
  
  module.exports = {Rules};
  