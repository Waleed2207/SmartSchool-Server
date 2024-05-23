//const Rule = require("../models/Rule");
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
const { getRooms,getRoomById,getRoomIdByRoomName,get_Rooms_By_SpaceId,getRoomByName,getAllRoomIds,getAllRoomNames} = require('./rooms.service');  
//const { get_MotionState, update_Motion_DetectedState} = require('../controllers/sensorController.js');
const {GetRoomNameFromDatabase} = require('../../SmartSchool-Server/interpeter/src/executor/executor');
const  InterpeterManger  = require('../../SmartSchool-Server/interpeter/src/InterpeterClass/InterpeterManger.js');

  console.log("tetsting");
  console.log("Main function called");
  const manager = new InterpeterManger();
  manager.main().catch(e => console.error(e));



 

const validateRule = async (rule) => {
  const parsedRule = rule.split(" ");
  if (parsedRule[0] !== "IF") {
    return {
      statusCode: 400,
      message: "Rule must start with IF",
    };
  }

  if (
    !/\b(kitchen|living room|dining room|bedroom|bathroom|bedroom|Classroom)\b/i.test(
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

function stringifyCondition(condition) {
  return `IF ${condition.variable} ${condition.operator} ${condition.value}`;
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








// Function to interpret a rule by its description
async function interpretRuleByName(ruleDescription) {
  try {
    //console.log("interpretrulebyname%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^% ");
    // Find the rule by its description using await for the asynchronous operation
    const rule = await Rule.findOne({ description: ruleDescription });
    
    if (rule) {
      //const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;; 
    
      interpret(ruleDescription);
      return `Rule "${ruleDescription}" interpreted successfully.)}`; // Return a success message
    } else {
      console.log(`Rule "${ruleDescription}" not found.`);
      return `Rule "${ruleDescription}" not found.`; // Return an error message
    }
  } catch (error) {
    console.error(`Error fetching rule - ${error}`);
    return `Error fetching rule - ${error}`; // Return an error message
  }
}

  // Function to pass this context to the executor
  function interpret(input) {
    const tokens = tokenize(input);
    const parsed = parse(input); // Ensure this returns the correct structure
    //console.log("Sameer parsed",parsed);
    execute(parsed); // `parsed` should include condition and action
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




const updateRule = async (ruleId, updateFields) => {
  try {
    // Extract the 'rule' field from updateFields
    let rule = _.get(updateFields, "rule", "");

    if (rule !== "") {
      // Process and validate the 'rulxe' field
      const formattedRule = await ruleFormatter(rule);
      const ruleValidation = await validateRule(formattedRule);
      console.log(formattedRule);
    if (updateFields.description) {
      const formattedDescription = await descriptionFormatter(updateFields.description);
      const tempMatch = formattedDescription.match(/(\d+)°C/);
      console.log(tempMatch);
      if (tempMatch) {
        const formattedAction = `Turn AC ON to cool mode at ${tempMatch[1]}`;
        updateFields.action = formattedAction; // Now updating the action here
      }
      updateFields.description = formattedDescription;
    }

    // Validate the sensor condition if it's being updated
    if (updateFields.condition) {
      const sensorValidation = await validateSensor(updateFields.condition);
      if (sensorValidation.statusCode === 400) {
        return sensorValidation;
      }
    }

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




const removeAllRules = async () => {
  try {
    await Rule.deleteMany({});
  } catch (err) {
    console.log(`Error deleting all rules ${err.message}`);
  }
};







module.exports = {

   add_new_Rule,
  // getAllRules,
  // updateRule,
  // toggleActiveStatus,
  // deleteRuleById,
  // checkInterpreterCondition,
  // updateAndProcessRules,
  // interpretRuleByName,
  //getAllRulesDescription,
  // getRulesBySpaceId
  // validateRule,
  // insertRuleToDBMiddleware,
  // removeAllRules,
  //getAllDetections,
  //fetchRoomID,
  //fetchSpaceID,
 // fetchMotionState,
  // interpeter_result,
    // Make sure it is listed here correctly
};
