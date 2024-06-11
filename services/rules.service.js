const Rule = require("../models/Rule");
const Device = require("./../models/Device.js");
const RoomDevice = require("./../models/RoomDevice");
const { ObjectId, Int32 } = require("bson");
const { getSensors } = require("./sensors.service");
const { createRegexPattern, replaceWords } = require("../utils/utils");
const { getUsers } = require("./users.service");
const _ = require("lodash");
const { getSensiboSensors } = require('../api/sensibo')
const { tokenize } = require('../interpeter/src/lexer/lexer');
const { parse } = require('../interpeter/src/parser/parser');
const { execute } = require('../interpeter/src/executor/executor');
const { getCurrentActivity, getCurrentSeason } = require('./time.service'); // Import both getCurrentActivity and getCurrentSeason
const { getRooms,getRoomById,getRoomIdByRoomName,get_Rooms_By_SpaceId,getAllRoomIds,getAllRoomNames} = require('./rooms.service');  
const { get_MotionState, update_Motion_DetectedState} = require('../controllers/sensorController.js');
const {GetRoomNameFromDatabase} = require('../../SmartSchool-Server/interpeter/src/executor/executor');
// const { interpetermanger } = require('../../SmartSchool-Server/services/interpetermanger.js');

// const { Rules } = require('../models/Rules');
// const {
//   OPERATORS_MAP_FORMATTER,
//   SEASONS_MAP_FORMATTER,
//   HOURS_MAP_FORMATTER,
//   SENSOR_DEVICE_RELATION_MAP,
// } = require("../consts/rules.consts");
// const checkForDevices = (rule) => {
//   const devices = [];
//   if (/\b(ac)\b/i.test(rule)) devices.push("ac");
//   if (/\b(heater)\b/i.test(rule)) devices.push("heater");
//   if (/\b(dishwasher)\b/i.test(rule)) devices.push("dishwasher");
//   return devices;
// };

// const decideOnState = (rule) => {
//   return /\b(off)\b/i.test(rule) ? "on" : "off";
// };

// const validateSensor = async (rule) => {
//   const parsedRule = rule.split(" ");
//   const usersResponse = await getUsers();
//   const users = usersResponse.data.map(
//     ({ fullName }) => fullName.split(" ")[0]
//   );

//   const sensorsResponse = await getSensors();
//   const sensors = sensorsResponse.map(({ name }) => name);

//   const sensorsFromRuleString = [];

//   parsedRule.forEach((word, idx) => {
//     if (word === "AND" || word === "IF") {
//       sensorsFromRuleString.push(parsedRule[idx + 1]);
//     }
//   });

//   let invalidSensor = null;

//   sensorsFromRuleString.forEach((sensor) => {
//     if (!users.includes(sensor) && !sensors.includes(sensor)) {
//       invalidSensor = sensor;
//     }
//   });

//   if (invalidSensor) {
//     return {
//       statusCode: 400,
//       message: `We don't recognize ${invalidSensor}`,
//     };
//   }

//   return {
//     statusCode: 200,
//     message: `All sensors are valid`,
//   };
// };

const validateRule = async (rule) => {
  const parsedRule = rule.split(" ");
  if (parsedRule[0] !== "IF") {
    return {
      statusCode: 400,
      message: "Rule must start with IF",
    };
  }

  if (
    !/\b(kitchen|living room|dining room|bedroom|bathroom|bedroom|Class246|Class247)\b/i.test(
      rule
    )
  ) {
    return {
      statusCode: 400,
      message: "You must specify a room",
    };
  }

  if (!/THEN TURN\(".*"\)$/i.test(rule)) {
    return {
      statusCode: 400,
      message: "Rule must contain 'THEN TURN(...)' after the condition",
    };
  }

  return {
    statusCode: 200,
    message: "Rule  validated successfully",
  };
};


// const createUserDistanceMap = (users) => {
//   return users.reduce((map, user) => {
//     map[user] = `${user}_distance`;
//     return map;
//   }, {});
// };

const ruleFormatter = async (rule) => {
  const usersResponse = await getUsers();
  const users = usersResponse.data.map(
    ({ fullName }) => fullName.split(" ")[0]
  );
  const usersMap = createUserDistanceMap(users);

  const homeMap = { home: "0.001" };

  // replace operator

  rule = replaceWords(rule, OPERATORS_MAP_FORMATTER);
  rule = replaceWords(rule, SEASONS_MAP_FORMATTER);
  rule = replaceWords(rule, HOURS_MAP_FORMATTER);
  rule = replaceWords(rule, usersMap);
  rule = replaceWords(rule, homeMap);

  
  //add (" ")
  const index = rule.indexOf("TURN") + 4;
  rule =
  rule.slice(0, index) + `("` + rule.slice(index + 1, rule.length) + `")`;
  return rule;
};

// const insertRuleToDBMiddleware = async (rule, isStrict) => {
//   const keepPattern = /\b(KEEP)\b/;
//   const isWithKeep = keepPattern.test(rule);

//   if (!isWithKeep) {
//     console.log("GOOD")
//     return await insertRuleToDB(rule, isStrict, false);
//   } else {
//     console.log("NOT GOOD")
//     const action = rule.split(" THEN KEEP ")[1];
//     const conditions = rule.split(" THEN KEEP ")[0];
//     const numberPattern = /\d+/g;
//     const desiredValue = parseInt(rule.match(numberPattern)[0]);
//     const parsedAction = action.split(" ");
//     const sensor = parsedAction[0];
//     const room =
//       parsedAction[parsedAction.length - 1] === "room"
//         ? parsedAction[parsedAction.length - 2] +
//           " " +
//           parsedAction[parsedAction.length - 1]
//         : parsedAction[parsedAction.length - 1];
//     const device = SENSOR_DEVICE_RELATION_MAP[sensor];

//     const belowValueAction = `TURN ${device} on ${desiredValue - 1} in ${room}`;
//     const aboveValueAction = `TURN ${device} on ${desiredValue + 1} in ${room}`;
//     const inValueAction = `TURN ${device} off in ${room}`;

//     const belowValueCondition = `AND ${sensor} is ${desiredValue - 1} THEN`;
//     const aboveValueCondition = `AND ${sensor} is ${desiredValue + 1} THEN`;
//     const inValueCondition = `AND ${sensor} is ${desiredValue} THEN`;

//     const belowValueRule = `${conditions} ${belowValueCondition} ${aboveValueAction}`;
//     const aboveValueRule = `${conditions} ${aboveValueCondition} ${belowValueAction}`;
//     const inValueRule = `${conditions} ${inValueCondition} ${inValueAction}`;

//     const newRule = new Rule({
//       rule,
//       normalizedRule: rule,
//       isStrict,
//       isHidden: false,
//       isUIOnly: true, 
//     });
//     const ruleId = Math.floor(10000000 + Math.random() * 90000000);
//     newRule.id = ruleId;
//     await newRule.save();

//     await insertRuleToDB(belowValueRule, isStrict, true, ruleId);
//     await insertRuleToDB(aboveValueRule, isStrict, true, ruleId);
//     await insertRuleToDB(inValueRule, isStrict, true, ruleId);
//   }

//   return {
//     statusCode: 200,
//     message: 'rule added successfully'
//   }
// };
// Example context
// const context = {
//   temperature: 22,
//   humidity: 40
// };

// Function to handle rule objects directly

function stringifyCondition(condition) {
  return `IF ${condition.variable} ${condition.operator} ${condition.value}`;
}


// const getAllRulesDescription = async () => {
//   try {
//     const rules = await Rule.find({});
//     const devices = await Device.find({ state: 'on' });

//     let activeDescriptions = [];
//     let activeDevicesMap = {};

//     console.log('Active devices found:', devices.length);

//     // Create a map of active devices for quick lookup
//     devices.forEach(device => {
//       activeDevicesMap[device.device_id] = true;
//     });

//     console.log('Active devices map:', activeDevicesMap);

//     // Check each rule to see if it relates to an active device
//     rules.forEach(rule => {
//       console.log('Checking rule:', rule.description, 'isActive:', rule.isActive);
//       if (rule.isActive ) {
//         activeDescriptions.push(rule.description);
//       }
//     });
//     console.log('Active descriptions:', activeDescriptions);

//     if (activeDescriptions.length > 0) {
//       return {
//         statusCode: 200,
//         data: activeDescriptions,
//       };
//     } else {
//       return {
//         statusCode: 404,
//         message: "No active rules found",
//       };
//     }
//   } catch (error) {
//     console.error('Error fetching rules:', error);
//     return {
//       statusCode: 500,
//       message: `Error fetching rules - ${error}`,
//     };
//   }
// };

const getAllRulesDescription = async () => {
  try {
    const rules = await Rule.find({});
    const activeDevices = await Device.find({state: 'on' });

    
    let activeDescriptions = [];
    let devicesStateMap = {};
    console.log('Active devices found:', activeDevices.length);

     // Create a map of active devices for quick lookup
      activeDevices.forEach(device => {
      devicesStateMap[device.device_id] = device.state;
    });

    console.log('Devices state map:', devicesStateMap);

    if (activeDevices.length === 0) { // This means AC is off
      for (const rule of rules) {
        if (rule.isActive) {
          activeDescriptions.push(rule.description);
        }
      }
    }
    if (activeDescriptions.length > 0) {
      return {
        statusCode: 200,
        data: activeDescriptions, 
      };
    } else {
      return {
        statusCode: 201, 
        message: "No active rules found",
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error fetching rules - ${error}`,
    };
  }
};

// // Define the async function that fetches sensor data and processes rules
// async function updateAndProcessRules() {
//   // Place the rule checking code here if it needs to be part of the async function
//   console.log('Checking for rule updates...');
//   getAllRulesDescription();
//   try {
//     const data = await getSensiboSensors();
//     if (data) {
//       const context = {
//         temperature: data.temperature,
//         humidity: data.humidity
//       };
//       console.log("Fetched context:", context);
//       await processAllRules(context); 
//     } else {
//       console.log('Failed to fetch sensor data or no data available.');
//     }
//   } catch (error) {
//     console.error('An error occurred:', error.message);
//   }

// }

async function updateAndProcessRules() {
  try {
    const descriptionResult = await getAllRulesDescription();
    console.log("descriptionResult:", descriptionResult);

    if (descriptionResult.statusCode === 200) {
      const descriptions = descriptionResult.data;
      // console.log("Descriptions of rules:", descriptions);

      for (const description of descriptions) {
        try {
          const interpretResult = await interpretRuleByName(description);
          // console.log("Interpret result for rule:", description, interpretResult);

          // Check if interpretResult is a string and includes 'successfully'
          if (typeof interpretResult === 'string' && interpretResult.includes("successfully")) {
            console.log("Rule interpreted successfully");
            continue; // Continue processing other rules
          }
        } catch (error) {
          console.error(`Failed to interpret rule "${description}":`, error.message);
        }
      }
      return "All rules processed"; // If all rules are processed without breaking the loop
    } else {
      console.error('Failed to get rule descriptions:', descriptionResult.message);
    }
  } catch (error) {
    console.error('Error processing rule descriptions:', error);
  }
  return "No active rules"; // Return this if no rules are processed successfully
}

async function checkInterpreterCondition() {
  try {
    const interpretResult = await updateAndProcessRules(); 
    console.log("in checkInterpreterCondition Function, interpretResult:", interpretResult);
    if (interpretResult === "Rule interpreted successfully") {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking interpreter condition:', error);
    return false; // Return false in case of an error
  }
}
// Run the function immediately
updateAndProcessRules();
checkInterpreterCondition();
// Set an interval to run the function every 30 seconds
setInterval(updateAndProcessRules, 30000);


async function processAllRules(context) {
  try {
    // Await the promise to get the result object
    const descriptionResult = await getAllRulesDescription();
    // console.log(descriptionResult);

    // Check if the operation was successful
    if (descriptionResult.statusCode === 200) {
      // Extract the descriptions array
      const descriptions = descriptionResult.data;
      let acRules = [];
      let lightRules = [];      
      for (const description of descriptions) {

        // // Await the interpretation of each rule description
        // const interpretResult = await interpretRuleByName(description, context);
        // console.log(interpretResult);
        if (description.toLowerCase().includes("ac")) {
          const interpretResult = await interpretRuleByName(description, context);
          acRules.push(description);
        } else if (description.toLowerCase().includes("light")) {
          const interpretResult = await interpretRuleByName(description, context = null);
          lightRules.push(description);

        }
      }
    } else {
      console.error('Failed to get rule descriptions:', descriptionResult.message);
    }
  } catch (error) {
    console.error('Error processing rule descriptions:', error);
  }
}



// Function to interpret a rule by its description
// async function interpretRuleByName(ruleDescription, context) {
//   try {
//     // Find the rule by its description using await for the asynchronous operation
//     const rule = await Rule.findOne({ description: ruleDescription });

//     if (rule) {
//       const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
//       interpret(input, context);
//       return `Rule "${ruleDescription}" interpreted successfully. Context: ${JSON.stringify(context)}`; // Return a success message
//     } else {
//       console.log(`Rule "${ruleDescription}" not found.`);
//       return `Rule "${ruleDescription}" not found.`; // Return an error message
//     }
//   } catch (error) {
//     console.error(`Error fetching rule - ${error}`);
//     return `Error fetching rule - ${error}`; // Return an error message
//   }
// }

//   // Function to pass this context to the executor
//   function interpret(input, context) {
//     const tokens = tokenize(input);
//     const parsed = parse(tokens); // Ensure this returns the correct structure
//     console.log(parsed);
//     execute(parsed, context); // `parsed` should include condition and action
//   }
async function interpretRuleByName(ruleDescription) {
  try {
    console.log(ruleDescription);
    const rules = await Rule.find({ description: ruleDescription });
    // console.log(`Number of rules found: ${rules.length}`);
    if (rules.length > 0) {
      rules.forEach(rule => {
        interpret(rule.description); // Simulate rule interpretation
        console.log(`Rule "${rule.description}" interpreted successfully.`);
      });
      return {
        success: true,
        message: `Interpreted ${rules.length} rule(s) successfully.`,
        rules: rules.map(rule => ({
          description: rule.description,
          interpreted: true,
          details: rule
        }))
      };
    } else {
      console.log(`No rules found with description "${ruleDescription}".`);
      return {
        success: false,
        message: `No rules found with description "${ruleDescription}".`,
        rules: []
      };
    }
  } catch (error) {
    console.error(`Error fetching rules: ${error}`);
    return {
      success: false,
      message: `Error fetching rules: ${error.message}`,
      rules: []
    };
  }
}

function interpret(input) {
  const tokens = tokenize(input);
  const parsed = parse(tokens);
  // console.log("Received Parsed:"+ JSON.stringify(parsed));
  execute(parsed);
}


const add_new_Rule = async (ruleData) => {
  console.log("add new Rule");
  
  // Assuming ruleData is structured correctly according to your ruleSchema,
  // e.g., ruleData has description, condition (with variable, operator, value), action, and id
  const newRule = new Rule({
    description: ruleData.description,
    condition: ruleData.condition,
    id: ruleData.id || Math.floor(10000000 + Math.random() * 90000000).toString(),
    space_id: ruleData.space_id
  });

  console.log("rule going to save in the database");

  try {
    await newRule.save();
    console.log('Rule saved successfully');
    return {
      statusCode: 200,
      message: "Rule added successfully",
    };
  } catch (error) {
    console.error('Error saving rule:', error);
    return {
      statusCode: 500,
      message: `Error adding rule - ${error}`,
    };
  }
};

const getAllRules = async () => {
  try {
    const rules = await Rule.find();
    return {
      statusCode: 200,
      data: rules,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error fetching rules - ${error}`,
    };
  }
};

const getRulesBySpaceId = async (space_id) => {
  try {
    // Modify the query to filter rules based on the space ID
    const rules = await Rule.find({ space_id: space_id });
    return {
      statusCode: 200,
      data: rules,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error fetching rules for space ID ${space_id} - ${error}`,
    };
  }
};

// Function to format the description of a rule
const descriptionFormatter = async (description) => {
  let formattedDescription = description.trim();
  formattedDescription = formattedDescription.charAt(0).toUpperCase() + formattedDescription.slice(1);

  if (!formattedDescription.startsWith('If')) {
    formattedDescription = 'If ' + formattedDescription;
  }

  // Add any additional formatting rules here

  return formattedDescription;
};

// const actionFormatter = async (action) => {
//   // This should format the action string based on your requirements
//   // For now, this just trims the whitespace
//   return action.trim();
// };
const validateSensor = async (condition) => {
  // Validate the condition object against your sensor requirements
  // Replace the following with actual validation logic
  if (condition && condition.id) {
    // Assuming the condition must have an ID to be valid
    return {
      statusCode: 200,
      message: "Sensor validated successfully",
    };
  } else {
    return {
      statusCode: 400,
      message: "Invalid sensor condition",
    };
  }
};
// const updateRule = async (ruleId, updateFields) => {
//   try {
//     // If ruleId is a string that needs to be converted to ObjectId, uncomment the line below
//     // ruleId = mongoose.Types.ObjectId(ruleId);

//     // Format the description if it's being updated
//     if (updateFields.description) {
//       updateFields.description = await descriptixonFormatter(updateFields.description);
//       // Update the action based on the temperature found in the description
//       const tempMatch = updateFields.description.match(/(\d+)°C/);
//       if (tempMatch) {
//         updateFields.action = `Turn AC ON to cool mode at ${tempMatch[1]}`;
//       }
//     }

//     // If action needs to be formatted, uncomment the line below and implement actionFormatter
//     // if (updateFields.action) updateFields.action = await actionFormatter(updateFields.action);

//     // Validate the sensor condition if it's being updated
//     if (updateFields.condition) {
//       const sensorValidation = await validateSensor(updateFields.condition);
//       if (sensorValidation.statusCode === 400) {
//         return sensorValidation;
//       }
//     }

//     // Update the rule in the database
//     const result = await Rule.updateOne({ _id: ruleId }, { $set: updateFields });

//     if (result.modifiedCount === 1) {
//       return {
//         statusCode: 200,
//         message: "Rule updated successfully",
//       };
//     } else {
//       return {
//         statusCode: 404,
//         message: "Rule not found",
//       };
//     }
//   } catch (error) {
//     console.error(`Error updating rule: ${error}`);
//     return {
//       statusCode: 500,
//       message: `Error updating rule - ${error}`,
//     };
//   }
// };

const updateRule = async (ruleId, updateFields) => {
  try {
    // Process and validate the 'rule' field if it exists
    if (updateFields.rule) {
      const formattedRule = await ruleFormatter(updateFields.rule);
      const ruleValidation = await validateRule(formattedRule);
      if (ruleValidation.statusCode === 400) {
        return ruleValidation;
      }
      // Update the 'rule' field in updateFields
      updateFields.rule = formattedRule;
    }

    // Update and validate the description and action based on the target temperature
    if (updateFields.description) {
      const formattedDescription = await descriptionFormatter(updateFields.description);
      updateFields.description = formattedDescription;

      // Extract the target temperature, assuming it's mentioned after the action context in the description
      const targetTempMatch = formattedDescription.match(/to (\d+)°C/);
      if (targetTempMatch) {
        const newTargetTemp = targetTempMatch[1];

        // Ensure the action array is updated with the new temperature
        if (!updateFields.action) {
          // If action is not present in updateFields, retrieve current action from database
          const currentRule = await Rule.findOne({ id: ruleId });
          updateFields.action = currentRule.action;
        }

        let acActionUpdated = false;
        updateFields.action = updateFields.action.map((act) => {
          if (act.action.includes("Turn AC ON to cool mode at")) {
            acActionUpdated = true;
            return { action: `Turn AC ON to cool mode at ${newTargetTemp}` };
          }
          return act;
        });

        // If AC action was not found and updated, add it to the actions
        if (!acActionUpdated) {
          updateFields.action.push({
            action: `Turn AC ON to cool mode at ${newTargetTemp}`,
          });
        }
      }
    }

    // Validate the sensor condition if it's being updated
    if (updateFields.condition) {
      const sensorValidation = await validateSensor(updateFields.condition);
      if (sensorValidation.statusCode === 400) {
        return sensorValidation;
      }
    }

    // Update the rule in the database
    await Rule.updateOne({ id: ruleId }, { $set: updateFields });
    return {
      statusCode: 200,
      message: "Rule updated successfully",
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error updating rule - ${error}`,
    };
  }
};


async function deleteRuleById(ruleId) {
  try {
    const result = await Rule.deleteOne({ id: ruleId });
    await Rule.deleteMany({ relatedRule: ruleId });
    if (result.deletedCount === 1) {
      return { status: 200 };
    } else {
      return { status: 400 };
    }
  } catch (error) {
    console.error("Error deleting rule:", error);
    return { status: 500 };
  }
}

const toggleActiveStatus = async (ruleId, isActive) => {
  try {
    // Assuming updateRuleActiveStatus is an imported function from your services
    const updatedRule = await updateRuleActiveStatus(ruleId, !isActive); // Toggle the isActive value
    if (updatedRule) {
      toast.success("Rule status updated successfully!");
      // Update the local state in RulesTable to reflect this change
      const updatedRules = currentRules.map(rule =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      );
      setCurrentRules(updatedRules);
    }
  } catch (error) {
    console.error("Failed to update rule active status:", error);
    toast.error("Failed to update rule status.");
  }
};


module.exports = {
  // insertRuleToDB,
  add_new_Rule,
  getAllRules,
  updateRule,
  toggleActiveStatus,
  // removeRuleFromDB,
  deleteRuleById,
  getRulesBySpaceId
  // validateRule,
  // insertRuleToDBMiddleware,
  // removeAllRules,
};
