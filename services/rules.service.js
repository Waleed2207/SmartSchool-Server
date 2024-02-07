const Rule = require("../models/Rule");
const { ObjectId, Int32 } = require("bson");
const { getSensors } = require("./sensors.service");
const { createRegexPattern, replaceWords } = require("../utils/utils");
const { getUsers } = require("./users.service");
const _ = require("lodash");
const { getSensiboSensors } = require('../api/sensibo')
const { tokenize } = require('../interpeter/src/lexer/lexer');
const { parse } = require('../interpeter/src/parser/parser');
const { execute } = require('../interpeter/src/executor/executor');
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

// const validateRule = async (rule) => {
//   const parsedRule = rule.split(" ");
//   if (parsedRule[0] !== "IF") {
//     return {
//       statusCode: 400,
//       message: "Rule must start with IF",
//     };
//   }


//   if (
//     !/\b(kitchen|living room|dining room|bedroom|bathroom|bedroom)\b/i.test(
//       rule
//     )
//   ) {
//     return {
//       statusCode: 400,
//       message: "You must specify a room",
//     };
//   }

//   if (!/THEN TURN\(".*"\)$/i.test(rule)) {
//     return {
//       statusCode: 400,
//       message: "Rule must contain 'THEN TURN(...)' after the condition",
//     };
//   }

//   return {
//     statusCode: 200,
//     message: "Rule  validated successfully",
//   };
// };


// const createUserDistanceMap = (users) => {
//   return users.reduce((map, user) => {
//     map[user] = `${user}_distance`;
//     return map;
//   }, {});
// };

// const ruleFormatter = async (rule) => {
//   const usersResponse = await getUsers();
//   const users = usersResponse.data.map(
//     ({ fullName }) => fullName.split(" ")[0]
//   );
//   const usersMap = createUserDistanceMap(users);

//   const homeMap = { home: "0.001" };

//   // replace operator

//   rule = replaceWords(rule, OPERATORS_MAP_FORMATTER);
//   rule = replaceWords(rule, SEASONS_MAP_FORMATTER);
//   rule = replaceWords(rule, HOURS_MAP_FORMATTER);
//   rule = replaceWords(rule, usersMap);
//   rule = replaceWords(rule, homeMap);

  
//   //add (" ")
//   const index = rule.indexOf("TURN") + 4;
//   rule =
//   rule.slice(0, index) + `("` + rule.slice(index + 1, rule.length) + `")`;
//   return rule;
// };

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

// Function to pass this context to the executor
function interpret(input, context) {
  const tokens = tokenize(input);
  const parsed = parse(tokens); // Ensure this returns the correct structure
  console.log(parsed);
  execute(parsed, context); // `parsed` should include condition and action
}

// Function to interpret a rule by its description
// Function to interpret a rule by its description
async function interpretRuleByName(ruleDescription, context) {
  console.log("interpretRuleByName");

  try {
    // Find the rule by its description using await for the asynchronous operation
    const rule = await Rule.findOne({ description: ruleDescription });

    if (rule) {
      const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
      interpret(input, context);
      return `Rule "${ruleDescription}" interpreted successfully. Context: ${JSON.stringify(context)}`; // Return a success message
    } else {
      console.log(`Rule "${ruleDescription}" not found.`);
      return `Rule "${ruleDescription}" not found.`; // Return an error message
    }
  } catch (error) {
    console.error(`Error fetching rule - ${error}`);
    return `Error fetching rule - ${error}`; // Return an error message
  }
}

(async () => {
  const data = await getSensiboSensors();

  if (data) {
    const context = {
      temperature: data.temperature,
      humidity: data.humidity
    };

    console.log("Fetched context:", context);

    // Ensure that interpretRuleByName is awaited
    const result = await interpretRuleByName("burn the room", context);
    console.log(result); // Now this will wait for interpretRuleByName to complete
  } else {
    console.log('Failed to fetch sensor data or no data available.');
  }
})();



const add_new_Rule = async (ruleData) => {
  console.log("add new Rule");
  
  // Assuming ruleData is structured correctly according to your ruleSchema,
  // e.g., ruleData has description, condition (with variable, operator, value), action, and id
  const newRule = new Rule({
    description: ruleData.description,
    condition: {
      variable: ruleData.condition.variable,
      operator: ruleData.condition.operator,
      value: ruleData.condition.value
    },
    id: ruleData.id || Math.floor(10000000 + Math.random() * 90000000).toString(),
    action: ruleData.action,
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


// const add_new_Rule = async (rule, isStrict, isHidden, relatedRule = null) => {
//   // console.log({rule})
//   try {
//     const formattedRule = await ruleFormatter(rule);
//     const ruleValidation = await validateRule(formattedRule);
//     const sensorsValidation = await validateSensor(rule);

//     // console.log({ formattedRule, rule });

//     if (sensorsValidation.statusCode === 400) {
//       return {
//         statusCode: sensorsValidation.statusCode,
//         message: sensorsValidation.message,
//       };
//     }

//     if (ruleValidation.statusCode === 400) {
//       return {
//         statusCode: ruleValidation.statusCode,
//         message: ruleValidation.message,
//       };
//     }

//     const newRule = new Rule({
//       rule: formattedRule,
//       normalizedRule: rule,
//       isStrict,
//       isHidden,
//       relatedRule,
//     });
//     newRule.id = Math.floor(10000000 + Math.random() * 90000000);
//     await newRule.save();

//     return {
//       statusCode: 200,
//       message: "Rule added successfully",
//     };
//   } catch (err) {
//     return {
//       statusCode: 500,
//       message: `Error adding rule - ${err}`,
//     };
//   }
// };

// const removeRuleFromDB = async (id) => {
//   try {
//     console.log("--------Delete Rule--------", id);
//     await Rule.deleteOne({ id: id });
//     await Rule.deleteMany({ relatedRule: id });
//     return {
//       statusCode: 200,
//       message: "Rule deleted successfully",
//     };
//   } catch (err) {
//     return {
//       statusCode: 500,
//       message: `Error deleting rule - ${err}`,
//     };
//   }
// };



// const updateRule = async (ruleId, updateFields) => {
//   try {
//     // Extract the 'rule' field from updateFields
//     let rule = _.get(updateFields, "rule", "");

//     if (rule !== "") {
//       // Process and validate the 'rule' field
//       const formattedRule = await ruleFormatter(rule);
//       const ruleValidation = await validateRule(formattedRule);
//       //waleed enable it because is not work without sensors

//       // const sensorsValidation = await validateSensor(rule);
//       //
//       // if (sensorsValidation.statusCode === 400) {
//       //   return {
//       //     statusCode: sensorsValidation.statusCode,
//       //     message: sensorsValidation.message,
//       //   };
//       // }

//       if (ruleValidation.statusCode === 400) {
//         return {
//           statusCode: ruleValidation.statusCode,
//           message: ruleValidation.message,
//         };
//       }

//       // Update the 'rule' field in updateFields
//       updateFields = {
//         ...updateFields,
//         rule: formattedRule,
//         normalizedRule: rule,
//       };
//     }

//     // Update the rule in the database
//     await Rule.updateOne({ id: ruleId }, { $set: updateFields });
//     return {
//       statusCode: 200,
//       message: "Rule updated successfully",
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       message: `Error updating rule - ${error}`,
//     };
//   }
// };
// async function deleteRuleById(ruleId) {
//   try {
//     const result = await Rule.deleteOne({ id: ruleId });
//     await Rule.deleteMany({ relatedRule: ruleId });
//     if (result.deletedCount === 1) {
//       return { status: 200 };
//     } else {
//       return { status: 400 };
//     }
//   } catch (error) {
//     console.error("Error deleting rule:", error);
//     return { status: 500 };
//   }
// }

// const removeAllRules = async () => {
//   try {
//     await Rule.deleteMany({});
//   } catch (err) {
//     console.log(`Error deleting all rules ${err.message}`);
//   }
// };

// const removeUIOnlyRules = async (ruleId) => {
//   try {
    
//     await Rule.deleteMany({ id: ruleId });
//     // await Rule.deleteMany
//   } catch (err) {}
// };

module.exports = {
  // insertRuleToDB,
  add_new_Rule,
  getAllRules,
  // updateRule,
  // removeRuleFromDB,
  // deleteRuleById,
  // validateRule,
  // insertRuleToDBMiddleware,
  // removeAllRules,
};
