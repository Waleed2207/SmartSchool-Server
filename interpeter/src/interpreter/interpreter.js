const { CommandFactory } = require('../factories/commandFactory');
const { debug, Console } = require('console');
const RoomDevice = require("../../../models/RoomDevice");
const Rule = require("../../../models/Rule");
const Activity = require("../../../models/Activity");
const { getAllRoomIds, getRoomByName, getAllRoomNames } = require('../../../services/rooms.service');
const { getCurrentActivity, getCurrentSeason } = require('../../../services/time.service');
const { getDevicesByRoomId } = require("../../../services/devices.service");
const { tokenize } = require('../lexer/lexer');
const { parse } = require('../parser/parser');
const NodeCache = require('node-cache');
const { log } = require('util');
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Debounce mechanism
let debounceTimeout = null;

function debounce(fn, delay) {
    return function (...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => fn(...args), delay);
    };
}

function convertOperators(operators) {
    const operatorMap = {
        'and': '&&',
        'or': '||'
    };

    return operators.map(op => operatorMap[op.toLowerCase()] || op);
}

function evaluateLogic(results, operators) {
    if (results.length - 1 !== operators.length) {
        throw new Error("The number of operators should be one less than the number of results.");
    }

    if (operators.length === 0) {
        return results[0];
    }

    let currentValue = results[0];

    for (let i = 0; i < operators.length; i++) {
        const nextValue = results[i + 1];
        switch (operators[i]) {
            case '&&':
                currentValue = currentValue && nextValue;
                break;
            case '||':
                currentValue = currentValue || nextValue;
                break;
            default:
                console.error(`Unsupported operator: ${operators[i]}`);
                return false;
        }
    }
    return currentValue;
}

function getContextType(sentence, context) {
    const activities = ['studying', 'cooking', 'eating', 'playing', 'watching_tv', 'sleeping', 'outside'];
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    const words = sentence.toLowerCase().split(/\s+/);

    if (/\bnot in\b/.test(sentence)) {
        return context['detection'] === false;
    }

    if (/\bin\b/.test(sentence) && !/\bnot in\b/.test(sentence)) {
        return context['detection'] === true;
    }

    for (const word of words) {
        if (activities.includes(word)) {
            return context['activity'].toLowerCase() === word.toLowerCase();
        } else if (seasons.includes(word)) {
            return context['season'].toLowerCase() === word.toLowerCase();
        }
    }

    return null;
}
function evaluateConditionTemp(parsed, context) {
  const structuredVariablePattern = /\b(in room|detection|temperature|humidity|activity|season|hour)\b/gi;
  const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|not)\b/gi;
  const valuePattern = /\b(\d+|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping|night|evening)\b/gi;

  let results = [];
  parsed.conditions.forEach(condition => {
      console.log("Evaluating condition:", condition);
      
      // Extracting variable, operator, and value using RegExp
      let variableMatch = condition.match(structuredVariablePattern);
      let operatorMatch = condition.match(operatorPattern);
      let valueMatch = condition.match(valuePattern);

      if (!variableMatch || !operatorMatch || !valueMatch) {
          console.error("Invalid condition format:", condition);
          results.push(false);
          return;
      }

      let variable = variableMatch[0].toLowerCase();
      let operator = operatorMatch[0].toLowerCase();
      let conditionValue = valueMatch[0].toLowerCase();
      let contextValue = context[variable];
    
      if (contextValue === undefined) {
          console.error("Context value is undefined for variable:", variable);
          results.push(false);
          return;
      }

      // Handling different data types
      if (conditionValue === "true" || conditionValue === "false") {
          conditionValue = conditionValue === "true";
          contextValue = contextValue === "true" || contextValue === "1";
      } else if (!isNaN(conditionValue)) {
          conditionValue = parseFloat(conditionValue);
          contextValue = parseFloat(contextValue);
      } else {
          conditionValue = conditionValue.toString();
          contextValue = contextValue.toString();
      }

      // Evaluate the condition
      let result = false;
      switch (operator) {
          case 'is above':
              result = contextValue > conditionValue;
              break;
          case 'is below':
              result = contextValue < conditionValue;
              break;
          case 'is equal to':
          case 'is':
              result = contextValue === conditionValue;
              break;
          case 'is above or equal to':
              result = contextValue >= conditionValue;
              break;
          case 'is below or equal to':
              result = contextValue <= conditionValue;
              break;
          case 'in':
              if (typeof contextValue === 'string' || Array.isArray(contextValue)) {
                  result = contextValue.includes(conditionValue);
              } else {
                  console.error("Cannot use 'in' operator on non-string/array context value:", contextValue);
                  result = false;
              }
              break;
          case 'not':
              if (typeof contextValue === 'string' || Array.isArray(contextValue)) {
                  result = !contextValue.includes(conditionValue);
              } else {
                  console.error("Cannot use 'not' operator on non-string/array context value:", contextValue);
                  result = false;
              }
              break;
          default:
              console.error("Unsupported operator:", operator);
              result = false;
              break;
      }
      
      console.log(`Condition: ${condition}, Context Value: ${contextValue}, Condition Value: ${conditionValue}, Result: ${result}`);
      results.push(result);
  });

  return results;
}

function getContextTypeCAll(sentence, context) {
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    const words = sentence.toLowerCase().split(/\s+/);

    if (/\bnot in\b/.test(sentence)) {
        return context['detection'] === false;
    }

    if (/\bin\b/.test(sentence) && !/\bnot in\b/.test(sentence)) {
        return context['detection'] === true;
    }

    for (const word of words) {
        if (seasons.includes(word)) {
            return context['season'].toLowerCase() === word.toLowerCase();
        }
    }

    return null;
}
function evaluateConditionCalendar(parsed, context) {
    const structuredVariablePattern = /\b(in room|detection|temperature|activity|season)\b/gi;
    const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in|not)\b/gi;
    const valuePattern = /\b(\d+|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping|room)\b/gi;

    let results = [], result = null;
    parsed.conditions.forEach(condition => {
        result = getContextTypeCAll(condition, context);
        if (result !== null) {
            results.push(result);
        } else {
            let variableMatch = condition.match(structuredVariablePattern);
            let operatorMatch = condition.match(operatorPattern);
            let valueMatch = condition.match(valuePattern);

            if (!variableMatch || !operatorMatch || !valueMatch) {
                console.error("Invalid condition format:", condition);
                results.push(false);
                return;
            }

            let variable = variableMatch[0].toLowerCase();
            let operator = operatorMatch[0].toLowerCase();
            let conditionValue = valueMatch[0].toLowerCase();
            let contextValue = context[variable];

            // console.log("Variable:", variable);
            // console.log("Operator:", operator);
            // console.log("Condition Value:", conditionValue);
            // console.log("Context Value:", contextValue);

            if (contextValue === undefined) {
                console.error("Context value is undefined for variable:", variable);
                results.push(false);
                return;
            }

            if (conditionValue === "true" || conditionValue === "false") {
                conditionValue = (conditionValue === "true");
            }

            let result = false;
            switch (operator) {
                case 'is above':
                    result = parseFloat(contextValue) > parseFloat(conditionValue);
                    break;
                case 'is below':
                    result = parseFloat(contextValue) < parseFloat(conditionValue);
                    break;
                case 'is equal to':
                    result = contextValue.toString() === conditionValue;
                    break;
                case 'is':
                    result = contextValue.toString() === conditionValue;
                    break;
                case 'in':
                    if (typeof contextValue === 'string' || Array.isArray(contextValue)) {
                        result = contextValue.includes(conditionValue);
                    } else {
                        console.error("Cannot use 'in' operator on non-string/array context value:", contextValue);
                        result = false;
                    }
                    break;
                case 'not':
                    if (typeof contextValue === 'string' || Array.isArray(contextValue)) {
                        result = !contextValue.includes(conditionValue);
                    } else {
                        console.error("Cannot use 'not' operator on non-string/array context value:", contextValue);
                        result = false;
                    }
                    break;
                default:
                    console.error("Unsupported operator:", operator);
                    result = false;
                    break;
            }
            results.push(result);
        }
    });

    console.log(results);
    return results;
}

  
function evaluateCondition(parsed, context) {
  const structuredVariablePattern = /\b(in room|detection|temperature|activity|season)\b/gi;
  const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in|not)\b/gi;
  const valuePattern = /\b(\d+|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping|room)\b/gi;

  let results = [], result = null;
  parsed.conditions.forEach(condition => {
      result = getContextType(condition, context);
      if (result !== null) {
          results.push(result);
          return;
      } else {
          let variableMatch = condition.match(structuredVariablePattern);
          let operatorMatch = condition.match(operatorPattern);
          let valueMatch = condition.match(valuePattern);

          if (!variableMatch || !operatorMatch || !valueMatch) {
              console.error("Invalid condition format:", condition);
              results.push(false);
              return;
          }

          let variable = variableMatch[0].toLowerCase();
          let operator = operatorMatch[0].toLowerCase();
          let conditionValue = valueMatch[0].toLowerCase();
          let contextValue = context[variable];

        //   console.log("Variable:", variable);
        //   console.log("Operator:", operator);
        //   console.log("Condition Value:", conditionValue);
        //   console.log("Context Value:", contextValue);

          if (contextValue === undefined) {
              console.error("Context value is undefined for variable:", variable);
              results.push(false);
              return;
          }

          if (conditionValue === "true | True" || conditionValue === "false | False") {
              Boolean(conditionValue);
          }

          let result = false;
          switch (operator) {
              case 'is above':
                  result = parseFloat(contextValue) > parseFloat(conditionValue);
                  break;
              case 'is below':
                  result = parseFloat(contextValue) < parseFloat(conditionValue);
                  break;
              case 'is equal to':
                  result = contextValue.toString() === conditionValue;
                  break;
              case 'is':
                  result = contextValue.toString() === conditionValue;
                  break;
              case 'in':
                  if (typeof contextValue === 'string' || Array.isArray(contextValue)) {
                      result = contextValue.includes(conditionValue);
                  } else {
                      console.error("Cannot use 'in' operator on non-string/array context value:", contextValue);
                      result = false;
                  }
                  break;
              case 'not':
                  if (typeof contextValue === 'string' || Array.isArray(contextValue)) {
                      result = !contextValue.includes(conditionValue);
                  } else {
                      console.error("Cannot use 'not' operator on non-string/array context value:", contextValue);
                      result = false;
                  }
                  break;
              default:
                  console.error("Unsupported operator:", operator);
                  result = false;
                  break;
          }
          results.push(result);
      }
  });

  return results;
}


async function GetRoomNameFromDatabase(parsed) {
    const cachedRoomNames = cache.get('roomNames');
    let roomNames;
    if (cachedRoomNames) {
        roomNames = cachedRoomNames;
    } else {
        roomNames = await getAllRoomNames();
        cache.set('roomNames', roomNames);
    }

    const normalizedRoomNames = roomNames.map(name => name.toLowerCase().trim());
    const roomNamesPatternString = normalizedRoomNames.join('|');
    const roomNamesPattern = new RegExp(`\\b(${roomNamesPatternString})\\b`, 'i');
    const normalizedParsed = parsed.toLowerCase().trim();
    const roomNameMatch = normalizedParsed.match(roomNamesPattern);

    if (roomNameMatch && roomNameMatch[0]) {
        const matchedName = roomNameMatch[0].trim();
        const roomName = roomNames.find(name => name.toLowerCase() === matchedName);
        if (roomName) {
            const roomDetails = await getRoomByName(roomName);
            return { roomName, roomDetails };
        }
    }

    return { roomName: "", roomDetails: null };
}

async function processData(parsed, data, res, Context) {
    if (!parsed || !parsed.conditions || !Array.isArray(parsed.conditions)) {
        console.error("Parsed rule is undefined or has no conditions.");
        return;
    }
  
    const currentActivity = await getCurrentActivity();
    const currentSeason = await getCurrentSeason();
    // console.log(parsed.conditions);
    // console.log(parsed.specialOperators.condition_operators);
    // console.log(parsed.actions);
  
    const extractMainCondition = (condition) => {
      const regex = /(\w+)(?: in | not in | is )/;
      const match = condition.match(regex);
      return match ? match[1] : null;
    };
  
    let mainContext;
    if (parsed.conditions.length > 0) {
        mainContext = extractMainCondition(parsed.conditions[0]);
    }
  
    let context = {};
    if (mainContext === 'temperature' || mainContext === 'humidity' || mainContext === 'hour') {
        const temperatureStr = String(data.temperature);
        const humidityStr = String(data.humidity);
        context = {
            room_Name: data.roomName.trim().toLowerCase(),
            roomid: data.roomId,
            space_id: data.spaceId,
            temperature: parseInt(temperatureStr.split(' ')[0], 10),
            humidity: parseInt(humidityStr.split(' ')[0], 10),
        };
    } else {
        if (mainContext === 'party' || mainContext === 'weekend' || mainContext === 'lecture' || mainContext === 'holiday') {
            // console.log(mainContext);
            const parsedState = data.state === 'on' ? true : false;
            context = {
                detection: parsedState,
                season: currentSeason,
                room_Name: data.roomName.trim().toLowerCase(),
                roomid: data.room_id,
                space_id: data.space_id,
                control : 'manual',
            };
            // console.log(context);
        } else {
            context = {
                detection: data.motionState,
                activity: Context.activity || currentActivity,
                season: currentSeason,
                room_Name: data.RoomName.trim().toLowerCase(),
                roomid: data.roomId,
                space_id: data.spaceId,
            };
            // console.log(context);
        }
    }
  
    const { roomName, roomDetails } = await GetRoomNameFromDatabase(context.room_Name);
    if (!roomDetails) {
        console.error("Failed to fetch the room ID");
        return;
    }
  
    const roomDevicesResult = await getDevicesByRoomId(roomDetails.id);
    if (roomDevicesResult.statusCode !== 200) {
        console.error("Failed to fetch room devices:", roomDevicesResult.message);
        return;
    }
  
    let evaluationConditionResult = {};
    if (mainContext === 'temperature' || mainContext === 'humidity' || mainContext === 'hour') {
       evaluationConditionResult = evaluateConditionTemp(parsed, context);
    } else if (mainContext === 'party' || mainContext === 'weekend' || mainContext === 'lecture' || mainContext === 'holiday') {
       evaluationConditionResult = evaluateConditionCalendar(parsed, context);
    } else {
       evaluationConditionResult = evaluateCondition(parsed, context);
    }
  
    const convertedOperatorsCondition = convertOperators(parsed.specialOperators.condition_operators);
    const result = evaluateLogic(evaluationConditionResult, convertedOperatorsCondition);
  
    if (result) {
        if (context.room_Name === roomName.toLowerCase()) {
            for (const action of parsed.actions) {
                const commandExecuted = await CommandFactory.createCommand(action, roomDetails.id, roomDevicesResult.data,context, context.room_Name, data, res);
                console.log(commandExecuted ? "Command was executed successfully." : 'Action could not be executed:', action);
            }
        } else {
            console.log("Room name mismatch or undefined. No actions executed.");
        }
    } else {
        console.error("Conditions not met, no actions executed.");
    }
  }
  
function escapeRegex(text) {
    return text.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

async function interpretRuleByName(Condition, data, res, Context, alreadyTried = false) {
    try {
        // console.log(Condition);
        // console.log(data.spaceId);
        const regex = new RegExp(escapeRegex(Condition), 'i');

        let mainCondition;
        if (Condition.includes(' in ')) {
            mainCondition = Condition.split(' in ')[0]; // e.g., "temperature"
        } else if (Condition.includes(' not in ')) {
            mainCondition = Condition.split(' not in ')[0]; // e.g., "temperature"
        } else {
            mainCondition = Condition; // No "in" or "not in" found, use the whole condition
        }

        // Modify the query to include both the spaceId and the regex for the condition in the description
        const rules = await Rule.find({ 
            description: regex, 
            isActive: true,
            space_id: data.spaceId // Ensure spaceId matches the one provided in data
        });

        if (rules.length > 0) {
            for (const rule of rules) {
                if (mainCondition === 'temperature' || mainCondition === 'humidity') {
                    await interpret(rule.description, data, res, Context); // Process each rule found
                }
                await interpret(rule.description, data, res, Context); 
            }
        } else {
            if (!res.headersSent && !alreadyTried) {
                res.status(404).json({ message: "No matching rules found", success: false });
            } else if (!res.headersSent) {
                res.status(200).json({ message: "No new rules found, but request processed." });
            }
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: `Error fetching rules: ${error.message}` });
        }
    }
}


async function interpret(ruleDescriptionQuery, data, res, Context) {
    try {
        const tokens = tokenize(ruleDescriptionQuery); // Tokenize the rule description
        const parsed = parse(tokens); // Convert tokens to a structured format
        await processData(parsed, data, res, Context);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: `Failed to interpret rule due to error: ${error.message}` });
        }
    }
}


async function interpretRuleByNameHumD(Condition, data, shouldSendRes = false, res = null, alreadyTried = false) {
  try {
        // console.log(Condition);
        // console.log(data.spaceId);
        const regex = new RegExp(escapeRegex(Condition), 'i');

        let mainCondition;
        if (Condition.includes(' in ')) {
            mainCondition = Condition.split(' in ')[0]; // e.g., "temperature"
        } else if (Condition.includes(' not in ')) {
            mainCondition = Condition.split(' not in ')[0]; // e.g., "temperature"
        } else {
            mainCondition = Condition; // No "in" or "not in" found, use the whole condition
        }

        // console.log(mainCondition);
        // Modify the query to include both the spaceId and the regex for the condition in the description
        const rules = await Rule.find({ 
            description: regex, 
            isActive: true,
            space_id: data.spaceId // Ensure spaceId matches the one provided in data
        });

        if (rules.length > 0) {
            for (const rule of rules) {
                if (mainCondition === 'temperature' || mainCondition === 'humidity') {
                  await Interpret(rule.description, data, shouldSendRes, Context= null); // Process each rule found
                }
                await Interpret(rule.description, data, res, Context); 
            }
        } else {
          if (shouldSendRes && res && !res.headersSent && !alreadyTried) {
            res.status(404).json({ message: "No matching rules found", success: false });
          } else if (shouldSendRes && res && !res.headersSent) {
            res.status(200).json({ message: "No new rules found, but request processed." });
          } else {
            console.log("No matching rules found");
          }
        }
    } catch (error) {
      if (shouldSendRes && res && !res.headersSent) {
        res.status(500).json({ error: `Error fetching rules: ${error.message}` });
      } else {
        console.error(`Error fetching rules: ${error.message}`);
      }
    }
}

async function interpretRuleByNameCalendar(Condition, data, shouldSendRes = false, res = null, Context, alreadyTried = false) {
    try {
        // console.log(Condition);
        // console.log(data.space_id);
        const regex = new RegExp(escapeRegex(Condition), 'i');

        let mainCondition;
        if (Condition.includes(' in ')) {
            mainCondition = Condition.split(' in ')[0]; // e.g., "temperature"
        } else if (Condition.includes(' not in ')) {
            mainCondition = Condition.split(' not in ')[0]; // e.g., "temperature"
        } else {
            mainCondition = Condition; // No "in" or "not in" found, use the whole condition
        }

        const rules = await Rule.find({ 
            description: regex, 
            isActive: true,
            space_id: data.space_id // Ensure spaceId matches the one provided in data
        });

        if (rules.length > 0) {
            for (const rule of rules) {
                await Interpret(rule.description, data, shouldSendRes, res, Context); // Process each rule found
            }
        } else {
            if (shouldSendRes && res && !res.headersSent && !alreadyTried) {
                res.status(404).json({ message: "No matching rules found", success: false });
            } else if (shouldSendRes && res && !res.headersSent) {
                res.status(200).json({ message: "No new rules found, but request processed." });
            } else {
                console.log("No matching rules found");
            }
        }
    } catch (error) {
        if (shouldSendRes && res && !res.headersSent) {
            res.status(500).json({ error: `Error fetching rules: ${error.message}` });
        } else {
            console.error(`Error fetching rules: ${error.message}`);
        }
    }
}

async function Interpret(ruleDescriptionQuery, data, shouldSendRes = false, res = null, Context) {
    try {
        const tokens = tokenize(ruleDescriptionQuery); // Tokenize the rule description
        const parsed = parse(tokens); // Convert tokens to a structured format
        await processData(parsed, data, shouldSendRes ? res : null, Context);
    } catch (error) {
        if (shouldSendRes && res && !res.headersSent) {
            res.status(500).json({ error: `Failed to interpret rule due to error: ${error.message}` });
        } else {
            console.error(`Failed to interpret rule due to error: ${error.message}`);
        }
    }
}
module.exports = {
    GetRoomNameFromDatabase,
    interpretRuleByName,
    interpretRuleByNameHumD,
    interpretRuleByNameCalendar
};
