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


// Function to handle rule objects directly
function stringifyCondition(condition) {
  return `IF ${condition.variable} ${condition.operator} ${condition.value}`;
}

/*

const getAllRulesDescription = async () => 
{

  try 
  {
      console.log("getAllRulesDescription")
      // Fetch all rules
      const rules = await Rule.find({});

      // Initialize an empty array to hold descriptions of active rules
      const descriptions = [];

      // Loop through each rule to check if it is active
      rules.forEach(rule => {
        if ( rule.isActive) {
            descriptions.push(rule.description);
        }else{
          return ;
          console.log("the rule : " + rule.description + " , isActive : " + rule.isActive );
       }
    });
    // Now descriptions contains descriptions of all active rules
    console.log(descriptions);

    return {
      statusCode: 200,
      data: descriptions, // Return the descriptions
    };
  }catch (error) {
    return {
      statusCode: 500,
      message: `Error fetching rules - ${error}`,
    };
  }

}

  */

const getAllRulesDescription = async () =>
 {
  try {
    console.log("getallruledescription");
    const rules = await Rule.find({});
    const activeDevices = await Device.find({device_id: '4ahpAkJ9',  state: 'on'});

    let activeDescriptions = [];
    // gbd chnage it it was change to !== 0 
    if (activeDevices.length === 0) { // This means AC is off
      for (const rule of rules) {
        //gbd add the true | to see to get all the rule
        if (true | rule.isActive) {
          
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


/*
getAllRulesDescription().then((result) => {
  console.log("descriptions : " + result.data);
  return result.data;
}).catch((error) => {
  console.error(error);
});
*/

// setInterval(() => {
//   console.log('Checking for rule updates...');
//   updateAndProcessRules();
// }, 30000);

// getAllRulesDescription();

//////waleed ********************************
// getAllRulesDescription().then((result) => {
//   console.log("descriptions : " + result.data);
//   return result.data;
// }).catch((error) => {
//   console.error(error);
// });



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
  const detection = await fetchMotionState();
 console.log("getandlogDetection " + "detection" + detection);
  return detection; // Return the detection data
}

/*

// Define the async function that fetches sensor data and processes rules
async function updateAndProcessRules() {
  try {
    console.log("UpdateAndProcess")
    const data = await getSensiboSensors();
    const detectionData = await getAndLogDetection();
  
    if (data) {
      const context = {
        temperature: data.temperature,
        humidity: data.humidity,
        motionDetected: detectionData.motionDetected
        
        
      };
      console.log("gbd try");
      console.log("context motionDeteted : " , context.motionDetected);
    
      
      await processAllRules(context); 
    } else {
      console.log('Failed to fetch sensor data or no data available.');
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }

  // Place the rule checking code here if it needs to be part of the async function
  console.log('Checking for rule updates...');
  getAllRulesDescription();
}

*/


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
     
        if (description.toLowerCase().includes("ac")) {
        
          const interpretResult = await interpretRuleByName(description, context);
          acRules.push(description);
        } else if (description.toLowerCase().includes("light")) {
          const interpretResult = await interpretRuleByName(description, context);
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
// Function to interpret a rule by its description
async function interpretRuleByName(ruleDescription, context) {
  try {
    // Find the rule by its description using await for the asynchronous operation
    const rule = await Rule.findOne({ description: ruleDescription });
    console.log("interpretrRuleNyName" + context)
    if (rule) {
      const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
      interpret(input, context);
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

/*
///fetch the data from the sensors 
(async () => {
  const data = await getSensiboSensors();
  if (data) {
    const context = {
      temperature: data.temperature,
      humidity: data.humidity
    };
    console.log("Fetched context:", context);
    await processAllRules(context); // Properly await the processing of rules
  } else {
    console.log('Failed to fetch sensor data or no data available.');
  }
})();
*/
/*
async function processAllRules(context) 
{
  try 
  {
    console.log("processAllRules");
    // Await the promise to get the result object
    const descriptionResult = await getAllRulesDescription();
    console.log("description result" + descriptionResult);
    // Check if the operation was successful
    if (descriptionResult.statusCode === 200) {
      // Extract the descriptions array
      const descriptions = descriptionResult.data;

      // Iterate over each description and interpret it
      for (const description of descriptions) {
        // Await the interpretation of each rule description
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


async function fetchAndProcessRules() {
  try {

    console.log("fetchAndproccessAllRules")

    // Get current date and time
    const now = new Date();
    // Format the time as hour:minute:second
    const timestamp = now.toLocaleTimeString(); // This will use the system's locale to format the time

    console.log(`[${timestamp}] Attempting to fetch sensor data...`);
    const data = await getSensiboSensors();
    const detectionData = await getAndLogDetection();
    
    

    if (data) {
      const context = {
        temperature: data.temperature,
        humidity: data.humidity,
        detection: detectionData.motionDetected
        
        
      };
     
      console.log(`[${timestamp}] Fetch and proccess  context  `, context);
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
setInterval(fetchAndProcessRules, 30000);

/*
setInterval(fetchAndProcessRules, intervalTime);
*/
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
  add_new_Rule,
  getAllRules,
  updateRule,
  toggleActiveStatus,
  // removeRuleFromDB,
  deleteRuleById,
  // validateRule,
  // insertRuleToDBMiddleware,
  // removeAllRules,

};
