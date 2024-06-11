// const {CommandFactory} = require('../factories/commandFactory');
// const eventEmitter = require('./../events');

// // Listener for motion events
// eventEmitter.on('motionDetected', (data) => {
//     console.log(`Motion detected: executing related commands with data`, data);
//     execute(data, data.context); // Adjust according to what `data` structure is
// });


// function evaluateCondition({ variable, operator, value }, context) {
//     console.log(`Evaluating condition: ${variable} ${operator} ${value}`);

//     const varValue = parseFloat(context[variable]);
//     const conditionValue = parseFloat(value);

//     switch (operator) {
//         case 'is above':
//             return varValue > conditionValue;
//         case 'is below':
//             return varValue < conditionValue;
//         case 'is equal to':
//             return varValue === conditionValue;
//         case 'is above or equal to':
//             return varValue >= conditionValue;
//         case 'is below or equal to':
//             return varValue <= conditionValue;
//         case 'or':
//             return varValue || conditionValue;
//         case 'and':
//             return varValue && conditionValue;
//         default:
//             throw new Error(`Unknown operator: ${operator}`);
//     }
// }


// function execute(parsed, context) {
//     console.log('Execute function called with:', parsed, context);
//     if (parsed.condition && parsed.condition.operator) {
//         if (evaluateCondition(parsed.condition, context)) {
//             console.log(`Condition met, executing action: ${parsed.action}`);
            
//             // Check if the action is defined
//             if (!parsed.action) {
//                 console.log('Parsed action is undefined. Check the parsing logic.');
//                 return;
//             }
            
//             const command = CommandFactory.createCommand(parsed.action);
//             if (command) {
//                 command.execute();
//             } else {
//                 console.log('Action could not be executed:', parsed.action);
//                 // Add additional logging here to help with debugging
//                 console.log('CommandFactory returned undefined or null for the action.');
//             }
//         } else {
//             console.log(`Condition not met, action not executed.`);
//         }
//     } else {
//         console.log('Invalid condition structure:', parsed.condition);
//     }
// }


// module.exports = { execute };

const { CommandFactory } = require('../factories/commandFactory');
const { debug, Console } = require('console');
const RoomDevice = require("../../../models/RoomDevice");
const Rule = require("../../../models/Rule");
const Activity = require("../../../models/Activity");
const { getAllRoomIds, getRoomByName, getAllRoomNames } = require('../../../services/rooms.service');
const { getCurrentActivity, getCurrentSeason } = require('../../../services/time.service');
const { get_MotionState } = require('../../../controllers/sensorController');
const { getDevicesByRoomId } = require("../../../services/devices.service");
const { tokenize } = require('../lexer/lexer');
const { parse } = require('../parser/parser');
const emitter = require('../events');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes
let isListenerRegistered = false;

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
    const currentActivity = await getCurrentActivity();
    const currentSeason = await getCurrentSeason();

    const context = {
        detection: data.motionState,
        activity: Context.activity,
        season: currentSeason,
        room_Name: data.RoomName.trim().toLowerCase(),
        roomid: data.RoomID,
        space_id: data.space_id,
    };

    if (!parsed || !parsed.conditions || parsed.conditions.length === 0) {
        console.error("Parsed rule is undefined or has no conditions.");
        return;
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

    const evaluationConditionResult = evaluateCondition(parsed, context);
    const convertedOperatorsCondition = convertOperators(parsed.specialOperators.condition_operators);
    const result = evaluateLogic(evaluationConditionResult, convertedOperatorsCondition);

    if (result) {
        if (context.room_Name === roomName.toLowerCase()) {
            for (const action of parsed.actions) {
                const commandExecuted = await CommandFactory.createCommand(action, roomDetails.id, roomDevicesResult.data, context.room_Name, data, res);
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
        console.log(Condition);
        console.log(data.spaceId);
        const regex = new RegExp(escapeRegex(Condition), 'i');
        
        // Modify the query to include both the spaceId and the regex for the condition in the description
        const rules = await Rule.find({ 
            description: regex, 
            isActive: true,
            space_id: data.spaceId // Ensure spaceId matches the one provided in data
        });

        if (rules.length > 0) {
            for (const rule of rules) {
                await interpret(rule.description, data, res, Context); // Process each rule found
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

function execute() {
    return new Promise((resolve, reject) => {
        if (!isListenerRegistered) {
            emitter.on('motionStateChange', debounce(async (data) => {
                try {
                    if (!data || typeof data.motionState === 'undefined' || !data.RoomName) {
                        reject(new Error("Incomplete data received."));
                        return;
                    }
                    const { event,spaceId, lightState, motionState, deviceId, RoomName, res, roomId, _User_Oid } = data;

                    const controlSuccess = await simulateLightControl(deviceId, lightState);
                    if (!controlSuccess) {
                        throw new Error('Failed to control device state.');
                    }
                    // Parse the event string
                    const [person, motionStateStr, ...roomNameParts] = event.split(" ");
                    const parsedMotionState = (motionStateStr === 'on') ? 'in' : 'not in';
                    const parsedRoomName = roomNameParts.join(" ");

                    console.log(`Parsed event data - Person: ${person}, Motion State: ${parsedMotionState}, Room Name: ${parsedRoomName}`);

                    const currentActivity = await getCurrentActivityForUser(_User_Oid);
                    const currentSeason = await getCurrentSeason();
                    const conditionKeyword = motionState ? 'in' : 'not in';
                    const roomName = RoomName;
                    const Context = {
                        detection: motionState,
                        activity: currentActivity,
                        season: currentSeason,
                    };

                    let Condition;
                    Condition = `${person} ${parsedMotionState} ${parsedRoomName}`

                    await interpretRuleByName(Condition, data, res, Context, true);
                    resolve();
                } catch (error) {
                    if (!res.headersSent) {
                        res.status(500).json({ error: `Failed to process the request: ${error.message}` });
                    }
                    reject(error);
                }
            }, 1000)); // Debounce with a delay of 1 second

            isListenerRegistered = true;
        } else {
            resolve(); // Resolve immediately if listener is already set up
        }
    });
}

async function getCurrentActivityForUser(userId) {
    const cachedActivity = cache.get(`activity_${userId}`);
    if (cachedActivity) {
        return cachedActivity;
    }

    try {
        const activity = await Activity.findOne({ user: userId }).sort({ createdAt: -1 }).exec(); // Assuming activities have a createdAt field
        if (!activity) {
            throw new Error('No activity found for this user.');
        }
        cache.set(`activity_${userId}`, activity.name);
        return activity.name;
    } catch (error) {
        throw new Error('Failed to fetch current activity.');
    }
}

async function simulateLightControl(deviceId, state) {
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}

module.exports = {
    execute,
    GetRoomNameFromDatabase
};
