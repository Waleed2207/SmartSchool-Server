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
        if (rule.isActive) {
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
  } catch (error) {
    return {
      statusCode: 500,
      message: `Error fetching rules - ${error}`,    };
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

async function processAllRules(context) 
{
  try 
  {
    console.log("processAllRules");
    // Await the promise to get the result object
    const descriptionResult = await getAllRulesDescription();

    // Check if the operation was successful
    if (descriptionResult.statusCode === 200) {
      // Extract the descriptions array
      const descriptions = descriptionResult.data;

      // Iterate over each description and interpret it
      for (const description of descriptions) {
        // Await the interpretation of each rule description
        const interpretResult = await interpretRuleByName(description, context);
        console.log(interpretResult);
      }
    } else {
      console.error('Failed to get rule descriptions:', descriptionResult.message);
    }
  } catch (error) {
    console.error('Error processing rule descriptions:', error);
  }
}


async function fetchAndProcessRules() {
  try {
    // Get current date and time
    const now = new Date();
    // Format the time as hour:minute:second
    const timestamp = now.toLocaleTimeString(); // This will use the system's locale to format the time

    console.log(`[${timestamp}] Attempting to fetch sensor data...`);
    const data = await getSensiboSensors();
    if (data) {
      const context = {
        temperature: data.temperature,
        humidity: data.humidity
      };
      console.log(`[${timestamp}] Fetched context:`, context);
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
const intervalTime = 30000;// 50 secondes
fetchAndProcessRules() 
/*
setInterval(fetchAndProcessRules, intervalTime);
*/
// Function to handle rule objects directly
function stringifyCondition(condition) {
  return `IF ${condition.variable} ${condition.operator} ${condition.value}`;
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



module.exports = {
  add_new_Rule,
  getAllRules,
  
};
