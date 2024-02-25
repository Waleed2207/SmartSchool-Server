/*
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


/*
const getAllRulesDescription = async () => {
  try {
    // Fetch all rules without any condition
    const rules = await Rule.find({}); // Use an empty object {} to fetch all documents
    // Extract descriptions from each rule
    const descriptions = rules.map(rule => rule.description);
   
    console.log({descriptions})
    
    

    return {
      statusCode: 200,
      data: descriptions, // Return the descriptions
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error fetching rules - ${error}`,    };
  }
};


getAllRulesDescription().then((result) => {
 
  return result.data;
}).catch((error) => {
  console.error(error);
});

async function processAllRules(context) {
  try {
    // Await the promise to get the result object
    const descriptionResult = await getAllRulesDescription();
    // Check if the operation was successful
    if (descriptionResult.statusCode === 200) {
      // Extract the descriptions array
      const descriptions = descriptionResult.data;
      
      
      console.log({descriptions});
      // Iterate over each description and interpret it
      for (const description of descriptions) {
        // Await the interpretation of each rule description
        console.log({description})
        const interpretResult = await interpretRuleByName(description, context);
        
      }
    } else {
      console.error('Failed to get rule descriptions:', descriptionResult.message);
    }
  } catch (error) {
    console.error('Error processing rule descriptions:', error);
  }
}
*/

/*------------------------------interpret and interpretRuleByName--------------------------------------- */
/*
// Function to handle rule objects directly
function stringifyCondition(condition) {
  return `IF ${condition.variable} ${condition.operator} ${condition.value}`;
}

// Executes a parsed rule within the given context
function interpret(input, context) {
  const tokens = tokenize(input);
  const parsed = parse(tokens);
  execute(parsed, context);
}

// Function to interpret a rule by its description
// Function to interpret a rule by its description
/*new code try  */
/*
async function interpretRuleByName(ruleDescription, context) {
  try {
      const rule = await Rule.findOne({ description: ruleDescription });
      if (rule) {
          const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
          console.log({input});
          interpret(input, context);
          return `Rule "${ruleDescription}" interpreted successfully. Context: ${JSON.stringify(context)}`;
      } else {
          return `Rule "${ruleDescription}" not found.`;
      }
  } catch (error) {
      console.error(`Error fetching rule - ${error}`);
      return `Error fetching rule - ${error}`;
  }
}

/*
async function interpretRuleByName(ruleDescription, context) 
{


  try {
    // Find the rule by its description using await for the asynchronous operation
    const rule = await Rule.findOne({ description: ruleDescription });

    if (rule) {
      const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
      console.log({input})
      interpret(input, context);
      return `Rule "${ruleDescription}" interpreted successfully. Context: ${JSON.stringify(context)}`; // Return a success message
    } else {
            return `Rule "${ruleDescription}" not found.`; // Return an error message
    }
  } catch (error) {
    console.error(`Error fetching rule - ${error}`);
    return `Error fetching rule - ${error}`; // Return an error message
  }
}
*/

/*----------------------------------proccess all rule function -----------------------------------*/
/*new code try*/
// Processes all rules with the given context
/*
async function processRulesAndInterpretDescriptions(context) {
  console.log("Starting processRulesAndInterpretDescriptions");
  const rules = await Rule.find({});
  const descriptions = rules.map(rule => rule.description);
  console.log("Fetched descriptions:", descriptions);

  for (const description of descriptions) {
      console.log("Interpreting description:", description);
      await interpretRuleByName(description, context);
  }
}

/* Old processRulesAndInterpretDescriptions
async function processRulesAndInterpretDescriptions(context) {
  console.log("the function : processRulesAndInterpretDescriptions!!!!!!")
  // Part equivalent to getAllRulesDescription
  async function getAllRulesDescription() 
  {
    console.log("Starting getAllRulesDescription");
    try {
      const rules = await Rule.find({});
      const descriptions = rules.map(rule => rule.description);
      console.log("Fetched descriptions:", { descriptions });
      return {
        statusCode: 200,
        data: descriptions,
      };
    } catch (error) {
      console.error("Error in getAllRulesDescription:", error);
      return {
        statusCode: 500,
        message: `Error fetching rules - ${error}`,
      };
    }
  }

*/

/*
  // Part equivalent to the processing logic after fetching descriptions
  async function processAllRules(context) 
  {
    console.log("Starting processAllRules");
    try {
      const descriptionResult = await getAllRulesDescription();
      if (descriptionResult.statusCode === 200) {
        const descriptions = descriptionResult.data;
        console.log("Processing descriptions:", { descriptions });
        for (const description of descriptions) {
          console.log("Interpreting description:", { description });
          const interpretResult = await interpretRuleByName(description, context);
          // Handle the interpretResult if needed
        }
      } else {
        console.error('Failed to get rule descriptions:', descriptionResult.message);
      }
    } catch (error) {
      console.error('Error in processAllRules:', error);
    }
  }

  // Starting the entire process
  console.log("Initiating processRulesAndInterpretDescriptions");
  try {
    await processAllRules();
    console.log("Finished processRulesAndInterpretDescriptions");
  } catch (error) {
    console.error("Error in processRulesAndInterpretDescriptions:", error);
  }


// Main function to fetch sensor data and process rules
async function fetchAndProcessRules() {
  try {
      const data = await getSensiboSensors();
      if (data) {
          const context = {
              temperature: data.temperature,
              humidity: data.humidity
          };
          await processRulesAndInterpretDescriptions(context);
      } else {
          console.log('Failed to fetch sensor data or no data available.');
      }
  } catch (error) {
      console.error("An error occurred:", error);
  }
}

fetchAndProcessRules(); // Initiates the rule processing with fetched sensor data

/*--------------------------------------------------------------------------------------------------*/



/*
(async () => {
  const data = await getSensiboSensors();
  if (data) {
    const context = {
      temperature: data.temperature,
      humidity: data.humidity
    };
    
    await processAllRules(context); // Properly await the processing of rules
  } else {
    console.log('Failed to fetch sensor data or no data available.');
  }
})();
*/

/*
(async () => {
  const data = await getSensiboSensors();
  if (data) {
    const context = {
      temperature: data.temperature,
      humidity: data.humidity
    };
    
    // Now, call the function with the fetched context
    await processRulesAndInterpretDescriptions(context);
  } else {
    console.log('Failed to fetch sensor data or no data available.');
  }
})();



const add_new_Rule = async (ruleData) => {
 
  
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

*/

/*------------------new code ------------*/



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

// Helper function to stringify a condition object for interpretation
function stringifyCondition(condition) {
  console.log("stringifyCondition")
    return `IF ${condition.variable} ${condition.operator} ${condition.value}`;
}

// Executes the interpreted rule within the given context
function interpret(input, context) {
  console.log("Interpret ")
    const tokens = tokenize(input);
    const parsed = parse(tokens);
    execute(parsed, context);
}

// Asynchronously finds and interprets a rule by its description
async function interpretRuleByName(ruleDescription, context) {
  console.log("interpretRuleByName")
    try {
        const rule = await Rule.findOne({ description: ruleDescription });
        if (rule) {
            const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
            console.log({input});
            interpret(input, context);
            return `Rule "${ruleDescription}" interpreted successfully. Context: ${JSON.stringify(context)}`;
        } else {
            return `Rule "${ruleDescription}" not found.`;
        }
    } catch (error) {
        console.error(`Error fetching rule - ${error}`);
        return `Error fetching rule - ${error}`;
    }
}

// Processes all rules with the given context
async function processRulesAndInterpretDescriptions(context) {
  console.log("Starting to process rules and interpret descriptions");
  const rules = await Rule.find({});
  for (const rule of rules) {
      if (rule.isActive) { // Check if the rule is active
          console.log(`Interpreting rule: ${rule.description}`);
          await interpretRuleByName(rule.description, context);
      } else {
          console.log(`Rule: ${rule.description} is not active and will not be interpreted.`);
      }
  }
}
// Main function to fetch sensor data and initiate rule processing
async function fetchAndProcessRules() {
  console.log("Fetching sensor data and processing rules...");
  try {
      const data = await getSensiboSensors();
      if (data) {
          const context = {
              temperature: data.temperature,
              humidity: data.humidity
          };
          await processRulesAndInterpretDescriptions(context);
      } else {
          console.log('Failed to fetch sensor data or no data available.');
      }
  } catch (error) {
      console.error("An error occurred during sensor data fetch:", error);
  }
}


/*
// Initiates the rule processing with fetched sensor data
fetchAndProcessRules().then(() => console.log("Finished processing rules."))
.catch(error => console.error("An error occurred during rule processing:", error));
*/
setInterval(() => {
  const now = new Date();
  console.log(`Triggering fetchAndProcessRules at ${now.toLocaleTimeString()}`);
  fetchAndProcessRules();
}, 30000)

module.exports = {
    add_new_Rule: async (ruleData) => { /* Implementation here */ },
    getAllRules: async () => { /* Implementation here */ },
    // Further functions can be exported here
};



