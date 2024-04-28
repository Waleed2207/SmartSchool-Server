const Rule = require("../models/Rule");
const Device = require("./../models/Device.js");
const RoomDevice = require("./../models/RoomDevice");
const { ObjectId, Int32 } = require("bson");
const { getSensors } = require("./sensors.service");
const { createRegexPattern, replaceWords } = require("../utils/utils");
const { getUsers } = require("./users.service");
const _ = require("lodash");
const { getSensiboSensors } = require('../api/sensibo')
const { get_MotionState } = require('../controllers/sensorController.js')
const { checkforUserDistance } = require('../api/location.js')
const { tokenize } = require('../interpeter/src/lexer/lexer');
const { parse } = require('../interpeter/src/parser/parser');
const { execute } = require('../interpeter/src/executor/executor');
const { getCurrentActivity, getCurrentSeason } = require('./time.service'); // Import both getCurrentActivity and getCurrentSeason


// Function to handle rule objects directly
function stringifyCondition(condition) {
  return `IF ${condition.variable} ${condition.operator} ${condition.value}`;
}



const validateRule = async (rule) => {
  const parsedRule = rule.split(" ");
  if (parsedRule[0] !== "IF") {
    return {
      statusCode: 400,
      message: "Rule must start with IF",
    };
  }

  if (
    !/\b(kitchen|living room|dining room|bedroom|bathroom|bedroom)\b/i.test(
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


const getAllRulesDescription = async () =>
 {
  try {
    console.log("getallruledescription");
    const rules = await Rule.find({});

    const activeDevices = await Device.find({device_id: 'YNahUQcM',  state: 'on'});
   
    let activeDescriptions = [];
    
    if (activeDevices.length === 0) { // This means AC is off
      for (const rule of rules) {
        //gbd add the true | to see to get all the rule
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
        statusCode: 404, 
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





// Simulate calling the get_MotionState function directly
async function fetchMotionState() {
    // Mock request object (if needed)
    const req = {};
    let responseData;
    // Mock response object
    const res = {
        status: function(statusCode) {
            this.statusCode = statusCode;
            
            return this; // to allow chaining
        },
        json: function(data) {
          
          responseData = data // return the data for direct access
          return this
        }
    };

    try {
        // Directly call get_MotionState with mocked req and res
        await get_MotionState(req, res);
        return responseData

        // Use the result as needed
    } catch (error) {
        console.error('Error fetching motion state:', error);
        return null
    }
}


async function getAndLogDetection() {
  const detection = await fetchMotionState()
  return detection; // Return the detection data
}
async function processAllRules(context) {
  try {
    // Await the promise to get the result object
    console.log("ProcessAllRules");
    const descriptionResult = await getAllRulesDescription();
    
    // Check if the operation was successful
    if (descriptionResult.statusCode === 200) {
      // Extract the descriptions array
      const descriptions = descriptionResult.data;
  
      let acRules = [];
      let lightRules = [];      
      for (const description of descriptions) {
        // // Await the interpretation of each rule description
        // const interpretResult = await interpretRuleByName(description, context);
        
        const interpretResult = await interpretRuleByName(description, context);
        
        /*
        if (description.toLowerCase().includes("ac")) {
        
          const interpretResult = await interpretRuleByName(description, context);
          acRules.push(description);
        } else if (description.toLowerCase().includes("light")) {
          const interpretResult = await interpretRuleByName(description, context);
          lightRules.push(description);

        }
        */
      }
    } else {
      console.error('Failed to get rule descriptions:', descriptionResult.message);
    }
  } catch (error) {
    console.error('Error processing rule descriptions:', error);
  }
}




// Function to interpret a rule by its description
// Function to interpret a rule by its description
async function interpretRuleByName(ruleDescription, context) {
  try {
    // Find the rule by its description using await for the asynchronous operation
    const rule = await Rule.findOne({ description: ruleDescription });
    if (rule) {
      //const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
      interpret(ruleDescription, context);
      return `Rule "${ruleDescription}" interpreted successfully, Context: ${JSON.stringify(context)}`; // Return a success message
    } else {
      console.log(`Rule "${ruleDescription}" not found.`);
      return `Rule "${ruleDescription}" not found.`; // Return an error message
    }
  } catch (error) {
    console.error(`Error fetching rule - ${error}`);
    return `Error fetching rule - ${error}`; // Return an error message
  }
}
async function fetchAndProcessRules() {
  try {
    console.log("fetchAndProcessAllRules");

    // Get current date and time
    const now = new Date();
    // Format the time as hour:minute:second
    const timestamp = now.toLocaleTimeString(); // This will use the system's locale to format the time

    console.log(`[${timestamp}] Attempting to fetch sensor data...`);
    const data = await getSensiboSensors();
    const detectionData = await getAndLogDetection();
    const currentActivity = getCurrentActivity(); // Get the current activity based on the time of day
    const currentSeason = getCurrentSeason(); // Get the current season
    
    if (data) {
      const context = {
        joe: "room 247",
        temperature: data.temperature,
        humidity: data.humidity,
        detection: detectionData.motionDetected,
       // detection:true,
        //activity: currentActivity, // Include the current activity in the context
        activity: "studying",
        season: currentSeason // Include the current season in the context
      };
     
      console.log(`[${timestamp}] Fetch and process context`, context);
      await processAllRules(context); // Properly await the processing of rules
    } else {
      console.log(`[${timestamp}] Failed to fetch sensor data or no data available.`);
    }
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString(); // Log the time if an error occurs
    console.error(`[${timestamp}] An error occurred while fetching sensor data or processing rules:`, error);
  }
}
// Set an interval for running the fetchAndProcessRules function
// Set an interval to run the function every 30 seconds
fetchAndProcessRules()
setInterval(fetchAndProcessRules, 3 * 60 * 1000);

//setInterval(fetchAndProcessRules, 5000);

/*
setInterval(fetchAndProcessRules, intervalTime);
*/
// Function to handle rule objects directly
function stringifyCondition(condition) {
  return `IF ${condition.variable} ${condition.operator} ${condition.value}`;
}
  // Function to pass this context to the executor
function interpret(input, context) {
  console.log("interpret");
  //const tokens = tokenize(input);
  const parsed = parse(input); // Ensure this returns the correct structure
  // Correct use of JSON.stringify to log the condition object as a string
  if (parsed && parsed.conditions && parsed.actions && parsed.specialOperators && parsed.specialOperators.condition_operators) {
  execute(parsed, context);
  } else {
    console.error("Parsed object is incomplete or invalid:", parsed);
  }    
}

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
const updateRule = async (ruleId, updateFields) => {
  try {
    // Extract the 'rule' field from updateFields
    let rule = _.get(updateFields, "rule", "");

    if (rule !== "") {
      // Process and validate the 'rule' field
      const formattedRule = await ruleFormatter(rule);
      const ruleValidation = await validateRule(formattedRule);
      //waleed enable it because is not work without sensors

      // const sensorsValidation = await validateSensor(rule);
      //
      // if (sensorsValidation.statusCode === 400) {
      //   return {
      //     statusCode: sensorsValidation.statusCode,
      //     message: sensorsValidation.message,
      //   };
      // }

      if (ruleValidation.statusCode === 400) {
        return {
          statusCode: ruleValidation.statusCode,
          message: ruleValidation.message,
        };
      }

      // Update the 'rule' field in updateFields
      updateFields = {
        ...updateFields,
        rule: formattedRule,
        normalizedRule: rule,
      };
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
  add_new_Rule,
  getAllRules,
  updateRule,
  toggleActiveStatus,
  deleteRuleById,
};
