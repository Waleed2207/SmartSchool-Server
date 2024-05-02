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
const { getRooms,getRoomById,getRoomIdByRoomName,get_Rooms_By_SpaceId,getRoomByName,getAllRoomIds,getAllRoomNames} = require('./rooms.service');  
const { get_MotionState } = require('../controllers/sensorController.js');


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
/**
 * Generic function to fetch data based on a specified key.
 * @param {string} key The key in the response data to return.
 * @returns {Promise<*>} The data associated with the key, or null if an error occurs.
 */
async function fetchData(key) {
  const req = {};
  let responseData;

  const res = {
      status: function(statusCode) {
          this.statusCode = statusCode;
          return this;  
      },
      json: function(data) {
          responseData = data;  
          return this;
      }
  };

  try {
      await get_MotionState(req, res);  // This should modify res
      if (!responseData || !(key in responseData)) {
          console.error(`Error: Key '${key}' not found in response data`);
          return null;
      }
      return responseData[key];
  } catch (error) {
      console.error(`Error fetching ${key}: ${error}`);
      return null;
  }
}


/**
* Fetches room ID using a generic fetchData function.
* @returns {Promise<string|null>}
*/
async function fetchRoomID() {
  return fetchData('RoomID');
}

/**
* Fetches space ID using a generic fetchData function.
* @returns {Promise<string|null>}
*/
async function fetchSpaceID() {
  return fetchData('SpaceID');
}

/**
* Fetches motion detection status using a generic fetchData function.
* @returns {Promise<boolean|null>}
*/
async function fetchMotionState() {
  return fetchData('motionDetected');
}

/**
* Fetches all detections concurrently and logs the results.
* @returns {Promise<Object>}
*/
async function getAllDetections() {
  try {
      const [roomID, spaceID, motionState] = await Promise.all([
          fetchRoomID(),
          fetchSpaceID(),
          fetchMotionState()
      ]);

      console.log(`Room ID: ${roomID}, Space ID: ${spaceID}, Motion Detected: ${motionState}`);
      return {
          roomID: roomID,
          spaceID: spaceID,
          motionDetected: motionState
      };
  } catch (error) {
      console.error('Error fetching detection data:', error);
      return null;
  }
}

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
// Define the async function that fetches sensor data and processes rules
// async function updateAndProcessRules() {
//   try {
//     console.log("update and process rules!#!#!@#@!#@!#!@#!@#@!");    
//     // Await the promise to get the result object
//       const descriptionResult = await getAllRulesDescription();
//       console.log(descriptionResult);

//       // Check if the operation was successful
//       if (descriptionResult.statusCode === 200) {
//           // Extract the descriptions array
//           const descriptions = descriptionResult.data;
//           let acRules = [];
//           let lightRules = [];
//           const roomNames = await getAllRoomNames();
//           const roomIDs = await getAllRoomIds();
//           const Rooms = await getRooms();
//           console.log("Room names:", roomNames);
//           console.log("Room ID",roomIDs);
//           // Create a dynamic regex pattern to match any of the room names
//           const patternString = roomNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
//           const roomPattern = new RegExp(`\\b(${patternString})\\b`, 'gi');
//           const roomIDpatternString = roomIDs.map(id=>id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
//           const roomIDPattern = new RegExp(`\\b(${roomIDpatternString})\\b`, 'gi');
          

//           for (const description of descriptions) {
//               console.log("Process all rules");
//               console.log(description); 
//               const RoomIDMatches = description.match(roomIDPattern);
//               const RoommsMatches = description.match(roomPattern).toString();
//               // Apply the regex to search the text
            
//               let roomid = RoomIDMatches ? RoomIDMatches :null;
//               let roomName = RoommsMatches ? RoommsMatches : null;

//               console.log("gbd RoomName : ",roomName);
//               console.log("Sameer Room ID:",roomid);
//               if (roomName === null | roomName === undefined) {
//                   console.error("No room matched in the description:", description);
//                   return ; // Skip this description if no room is found
//               }

//               try 
//               {
//                   // Get the room by its name
//                   const room = await getRoomByName(roomName);
//                   console.log("Room details:", JSON.stringify(room, null, 2));


//                   const data = await getSensiboSensors();
//                   console.log("Data from Sensibo:", data);

//                   if (data && room) {
//                       // Create a context object based on the data and room
//                       const context = {
//                           temperature: data.temperature,
//                           humidity: data.humidity,
//                           activity: "studying",
//                           season: "spring",
//                           Current_room: room,
//                       };
//                     const interpretResult = await interpretRuleByName(description, context); 
                     
//                       // Log the room details (optional)
//                       console.log("Room details:", JSON.stringify(room, null, 2));
//                   }else{
//                       console.error("No data from Sensibo");
//                       return;
//                   }
//               } catch (error) {
//                   console.error(`Failed to retrieve room "${roomName}":`, error.message);
//               }
//           }

        

//       } else {
//           console.error('Failed to get rule descriptions:', descriptionResult.message);
//       }
//   } catch (error) {
//       console.error('Error processing rule descriptions:', error);
//   }
// }

async function updateAndProcessRules() {
  try {
      console.log("Update and process rules!");
      const descriptionResult = await getAllRulesDescription();
      console.log(descriptionResult);

      if (descriptionResult.statusCode === 200) {
          const descriptions = descriptionResult.data;
          const roomIDs = await getAllRoomIds();
          console.log("Room IDs:", roomIDs);

          const roomIDpatternString = roomIDs.map(id => id.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
          const roomIDPattern = new RegExp(`(${roomIDpatternString})`, 'gi');
          console.log("Room ID Regex Pattern:", roomIDPattern);  // Debug print of the regex pattern

          for (const description of descriptions) {
              console.log("Processing rule:", description);
              const roomIDMatches = description.match(roomIDPattern);
              const roomid = roomIDMatches ? roomIDMatches[0] : null;
              console.log("Matched Room ID:", roomid);

              if (!roomid) {
                  console.error("No room ID matched in the description:", description);
                  continue;
              }

              try {
                  const room = await getRoomById(roomid);
                  if (!room) {
                      console.error(`Room not found with ID: ${roomid}`);
                      continue;
                  }
                  console.log("Room details:", JSON.stringify(room, null, 2));
              } catch (error) {
                  console.error(`Failed to retrieve room with ID "${roomid}":`, error.message);
              }
          }
      } else {
          console.error('Failed to get rule descriptions:', descriptionResult.message);
      }
  } catch (error) {
      console.error('Error processing rule descriptions:', error);
  }
}

 /*
// Evaluate the rule description
  if (description.toLowerCase().includes("ac")) {
    const interpretResult = await interpretRuleByName(description, context); 
      acRules.push(description);
  } else if (description.toLowerCase().includes("light")) {
      const interpretResult = await interpretRuleByName(description, context);
      lightRules.push(description);
  }
  */

// Run the function immediately


// Set an interval to run the function every 30 seconds
setInterval(updateAndProcessRules, 30000);

/*
async function processAllRules(context) {
  try {
      console.log("process all rules");

      // Await the promise to get the result object
      const descriptionResult = await getAllRulesDescription();
      console.log(descriptionResult);

      // Check if the operation was successful
      if (descriptionResult.statusCode === 200) {
          // Extract the descriptions array
          const descriptions = descriptionResult.data;
          let acRules = [];
          let lightRules = [];

          for (const description of descriptions) {
              const roomPattern = /\b(bathroom|livingroom|(class247|class 247)|room 247|season)\b/gi;

              let roomMatch = description.match(roomPattern);
//               let roomName = roomMatch ? roomMatch[0].toLowerCase() : null;
//               console.log("roomName",roomName); 
//               if (!roomName) {
//                   console.error("No room matched in the description:", description);
//                   return; // Skip this description if no room is found
//               }
             
//               try {
//                   // Get the room by its name
//                   const room = await getRoomByName(roomName);
//                   console.log("Room details:", JSON.stringify(room, null, 2));
//                   // Check if the room is found
//                   if (!room) {
//                       console.log(`Room "${roomName}" is null`);
//                       continue; // Skip this description if room is null
//                   }
//                   const interpretResult = await interpretRuleByName(description, room);
                 
//                   /*   
//                   // Evaluate the rule description
//                   if (description.toLowerCase().includes("ac")) {
//                       c
//                       acRules.push(description);
//                   } else if (description.toLowerCase().includes("light")) {
//                       const interpretResult = await interpretRuleByName(description, room);
//                       lightRules.push(description);
//                   }
//                   */

                
                  

//               } catch (error) {
//                   console.error(`Failed to retrieve room "${roomName}":`, error.message);
//               }
//           }

//           // Optional: Log the processed rule descriptions
//           console.log("AC Rules:", acRules);
//           console.log("Light Rules:", lightRules);

//       } else {
//           console.error('Failed to get rule descriptions:', descriptionResult.message);
//       }
//   } catch (error) {
//       console.error('Error processing rule descriptions:', error);
//   }
// }




// Function to interpret a rule by its description
async function interpretRuleByName(ruleDescription,context) {
  try {
    console.log("interpretrulebyname%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^% ");
    // Find the rule by its description using await for the asynchronous operation
    const rule = await Rule.findOne({ description: ruleDescription });
    
    if (rule) {
      //const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
      //console.log(`Interpreting rule: ${input}`); 
    
      interpret(ruleDescription, context);
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

  // Function to pass this context to the executor
  function interpret(input, context) {
    const tokens = tokenize(input);
    const parsed = parse(input); // Ensure this returns the correct structure
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
// const validateSensor = async (condition) => {
//   // Validate the condition object against your sensor requirements
//   // Replace the following with actual validation logic
//   if (condition && condition.id) {
//     // Assuming the condition must have an ID to be valid
//     return {
//       statusCode: 200,
//       message: "Sensor validated successfully",
//     };
//   } else {
//     return {
//       statusCode: 400,
//       message: "Invalid sensor condition",
//     };
//   }
// };
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
  deleteRuleById,
  getAllDetections,
  fetchRoomID,
  fetchSpaceID,
  fetchMotionState
};