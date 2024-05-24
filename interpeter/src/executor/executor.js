const {CommandFactory} = require('../factories/commandFactory');

// import {CommandFactory} from '../factories/commandFactory';


function evaluateCondition({ variable, operator, value }, context) {
    console.log(`Evaluating condition: ${variable} ${operator} ${value}`);

<<<<<<< Updated upstream
    const varValue = parseFloat(context[variable]);
    const conditionValue = parseFloat(value);
=======
function evaluateLogic(results, operators) {
   
   
>>>>>>> Stashed changes

    switch (operator) {
        case 'is above':
            return varValue > conditionValue;
        case 'is below':
            return varValue < conditionValue;
        case 'is equal to':
            return varValue === conditionValue;
        case 'is above or equal to':
            return varValue >= conditionValue;
        case 'is below or equal to':
            return varValue <= conditionValue;
        case 'or':
            return varValue || conditionValue;
        case 'and':
            return varValue && conditionValue;
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}


<<<<<<< Updated upstream
function execute(parsed, context) {
    if (parsed.condition && parsed.condition.operator) {
        if (evaluateCondition(parsed.condition, context)) {
            console.log(`Condition met, executing action: ${parsed.action}`);
            
            // Check if the action is defined
            if (!parsed.action) {
                console.log('Parsed action is undefined. Check the parsing logic.');
                return;
            }
            
            const command = CommandFactory.createCommand(parsed.action);
            if (command) {
                command.execute();
            } else {
                console.log('Action could not be executed:', parsed.action);
                // Add additional logging here to help with debugging
                console.log('CommandFactory returned undefined or null for the action.');
            }
        } else {
            console.log(`Condition not met, action not executed.`);
        }
    } else {
        console.log('Invalid condition structure:', parsed.condition);
=======



function getContextType(sentence, context) {

    const activities = ['studying', 'cooking', 'eating', 'playing', 'watching_tv', 'sleeping', 'outside'];
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    const words = sentence.toLowerCase().split(/\s+/);
    console.log("we are in get context type function");
  

    // Check for specific phrases before individual words
    if (/\bnot in\b/.test(sentence)) {
        console.log("sentence includes 'not in'");
        if (context['detection'] === false) {
            //console.log("detection in room is equal to false.");
            return true;
        } else {
            //console.log("detection in room is equal to true.");
            return false;
        }
    } else if (/\bin\b/.test(sentence)) {
        //console.log("sentence includes 'in'");
        if (context['detection'] === true) {
            //console.log("detection in room is equal to true.");
            return true;
        } else {
            //console.log("detection in room is equal to false.");
            return false;
        }
    }

    

    // Check each word against activities and seasons
    for (const word of words) {
        if (activities.includes(word)) {
            console.log("activity includes word");  
            if (context['activity'].toLowerCase() === word.toLowerCase()) {
             
                return true;
            } else {
                
                return false;
            }
        } else if (seasons.includes(word)) {
            console.log("season includes word");
            if (context['season'].toLowerCase() === word.toLowerCase()) {
                return true;
            } else {
                return false;
            }
        }
    }
    return null; // Return null if no matches found
}




function evaluateCondition(parsed, context) {  
    
    const structuredVariablePattern = /\b(in room|detection|temperature|activity|season)\b/gi;
    const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in|not)\b/gi;
    const valuePattern = /\b(\d+|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping|room)\b/gi;
    
    let results = [],result = null;
    
    result = getContextType(parsed, context);
    console.log("Result of getContextType:", result);
    if(result !== null)
    {
        // results.push(result);
        // console.log("Results length: ", results.length);
        return result;
    }
    else
    {
        //console.log("result is null");   
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
        //console.log("Condition evaluation result:", result);    
        results.push(result);
    }
    // console.log("Condition evaluation results:", results);
    return result;
}




async function GetRoomNameFromDatabase(parsed) {
    try {
       
       //console.log("Get Room Name From Database Function")
        // Fetch all room names from the database
        const roomNames = await getAllRoomNames();
        ;
 
        // Define the pattern to match room names
        const roomNamesPatternString = roomNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const roomNamesPattern = new RegExp(`\\b(${roomNamesPatternString})\\b`, 'i');
 
        // Search for a room name in the parsed string
        const roomNameMatch = parsed.match(roomNamesPattern);
        //console.log("Room Name Match:", roomNameMatch); 

        if (roomNameMatch && roomNameMatch[0]) {
            const roomName = roomNameMatch[0].trim();
            const roomDetails = await getRoomByName(roomName);
            return { roomName, roomDetails };
        } else {
            console.log("No matching room name found in the parsed text.");
            return { roomName: null, roomDetails: null };
        }
    } catch (err) {
        console.log("Error in getting room ID from room details:", err);
        return { roomName: null, roomDetails: null };
    }
}


async function execute(parsed) {
    let success = false;
    const currentActivity = await getCurrentActivity();
    const currentSeason = await getCurrentSeason();

    //console.log("Current Activity:", currentActivity);
    //console.log("Current Season:", currentSeason);

    // Mock data to replace emitter.on event
    const LivingRoom = {
        motionState: true, // or 'not detected'
        roomName: 'Living Room',
        roomid: '38197016',
        space_id: '61097711',
        name_space : "SmartHome"
    };

    const bathroom = {
        motionState: false, // or 'not detected'
        roomName: 'bathroom',
        roomid: '61097711-4866',
        space_id: '61097711',
        name_space: "SmartHome",
        icon: "bath"
    };

    const ClassRoom = {
        motionState: false, // or 'not detected'
        roomName: 'Class246',
        roomid: '67822610-8768',
        space_id: '67822610',
        name_space: "SmartSchool",
        icon: "ClassRoom"
    };
    
    

   

    const context = {
        detection : LivingRoom.motionState,
        //detection: mockData.motionState,
        // activity: currentActivity,
        // season: currentSeason,
        activity: 'studying',
        season: 'spring',
        roomName: LivingRoom.roomName,
        roomid: LivingRoom.roomid,
        space_id: LivingRoom.space_id,
    };

    // Get the room ID before you fetch devices
    let { roomName, roomDetails } = await GetRoomNameFromDatabase(parsed.conditions[0]);
    

    if (!roomDetails) {
        console.error("Failed to fetch the room ID");
        return success;
    }

    const roomDevicesResult = await getDevicesByRoomId(roomDetails.id);
    if (roomDevicesResult.statusCode !== 200) {
        console.error("Failed to fetch room devices:", roomDevicesResult.message);
        return success;
    }
    const roomdevices = roomDevicesResult.data;

    let evaluationConditionResult =[];

    parsed.conditions.forEach(condition => {
        console.log("Condition:", condition);
        evaluationConditionResult.push(evaluateCondition(condition, context));
        // if (context.detection === true) {
        //     // If context.detection is true, find conditions with "in"
        //     if (condition.includes('in')) {
        //         evaluationConditionResult.push(evaluateCondition(condition, context));
        //     }
        // } else if (context.detection === false) {
        //     // If context.detection is false, find conditions with "not in"
        //     if (condition.includes('not in')) {
        //         evaluationConditionResult.push(evaluateCondition(condition, context));
        //     } else {
        //         // For other conditions not containing "not in"
        //         evaluationConditionResult.push(evaluateCondition(condition, context));
        //     }
        // } else {
        //     // For other conditions (neither containing "in" nor "not in")
        //     console.log("other me so we activity or season");
        //     evaluationConditionResult.push(evaluateCondition(condition, context));
        // }
    
        
    });
    
    console.log("Evaluation Condition Result:", evaluationConditionResult.length);
    const convertedOperatorsCondition = convertOperators(parsed.specialOperators.condition_operators);
    const result = evaluateLogic(evaluationConditionResult, convertedOperatorsCondition);
    console.log("Result of condition evaluation:", result);
   
    if (!result) {
        console.log("Conditions not met, no actions executed.");
        return false ;
    }

    if (context.roomName.toLowerCase() === roomName.toLowerCase()) {
        for (const action of parsed.actions) {
            try {
                console.log("Executing action:", action);
                const commandExecuted = await CommandFactory.createCommand(action, roomDetails.id, roomdevices, roomName);
                if (commandExecuted) {
                    console.log("Command " + commandExecuted + "successfully executed.");
                    success = true;
                    return success;
                } else {
                    console.log('Action could not be executed:', action);
                }
            } catch (error) {
                console.error("Error during execution:", error);
            }
        }
    } else {
        console.log("Room name not matched or undefined. No actions executed.");
    }


    if (parsed.conditions.length === 0) {
        console.log('No conditions provided.');
    }
    if (parsed.actions.length === 0) {
        console.log('No actions provided.');
        
>>>>>>> Stashed changes
    }
    return success
}


<<<<<<< Updated upstream
module.exports = { execute };
=======


module.exports = {
    execute,
    GetRoomNameFromDatabase
 };



//  function getContextType(sentence, context) {
//     console.log("IN (get context type) Function");
//     const activities = ['studying', 'cooking', 'eating', 'playing', 'watching_tv', 'sleeping', 'outside'];
//     const seasons = ['spring', 'summer', 'fall', 'winter'];
//     const words = sentence.toLowerCase().split(/\s+/);

//     // console.log("sentence:", sentence);

//     // Check for specific phrases before individual words
//     if (/\bnot in\b/.test(sentence)) {
//         console.log("sentence includes 'not in'");
//         if (context['detection'] === false) {
//             console.log("detection in room is equal to false.");
//             return true;
//         } else {
//             console.log("detection in room is equal to true.");
//             return false;
//         }
//     } else if (/\bin\b/.test(sentence)) {
//         console.log("sentence includes 'in'");
//         if (context['detection'] === true) {
//             console.log("detection in room is equal to true.");
//             return true;
//         } else {
//             console.log("detection in room is equal to false.");
//             return false;
//         }
//     }

    

//     // Check each word against activities and seasons
//     for (const word of words) {
//         if (activities.includes(word)) {
//             if (context['activity'].toLowerCase() === word.toLowerCase()) {
               
//                 return true;
//             } else {
                
//                 return false;
//             }
//         } else if (seasons.includes(word)) {
//             if (context['season'].toLowerCase() === word.toLowerCase()) {
//                 return true;
//             } else {
//                 return false;
//             }
//         }
//     }

//     return null; // Return null if no matches found
// }




// function evaluateCondition(parsed, context) {  
//     console.log("IN (evaluate condition) Function"); 
//     const structuredVariablePattern = /\b(in room|detection|temperature|activity|season)\b/gi;
//     const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in|not)\b/gi;
//     const valuePattern = /\b(\d+|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping|room)\b/gi;
    
//     let results = [],result = null;
//     parsed.conditions.forEach(condition => {
//         result = getContextType(condition, context);
//         if(result !== null)
//         {
//             results.push(result);
//             return;
//         }
//         else
//         {
//             //console.log("result is null");   
//             let variableMatch = condition.match(structuredVariablePattern);
//             let operatorMatch = condition.match(operatorPattern);
//             let valueMatch = condition.match(valuePattern);
    
//             if (!variableMatch || !operatorMatch || !valueMatch) {
//                 console.error("Invalid condition format:", condition);
//                 results.push(false);
//                 return;
//             }
    
//             let variable = variableMatch[0].toLowerCase();
//             let operator = operatorMatch[0].toLowerCase();
//             let conditionValue = valueMatch[0].toLowerCase();
//             let contextValue = context[variable];

//             if (contextValue === undefined) {
//                 console.error("Context value is undefined for variable:", variable);
//                 results.push(false);
//                 return;
//             }

//             if (conditionValue === "true | True" || conditionValue === "false | False") {
//                 Boolean(conditionValue);
//             }

//             let result = false;
//             switch (operator) {
//                 case 'is above':
//                     result = parseFloat(contextValue) > parseFloat(conditionValue);
//                     break;
//                 case 'is below':
//                     result = parseFloat(contextValue) < parseFloat(conditionValue);
//                     break;
//                 case 'is equal to':
//                     result = contextValue.toString() === conditionValue;
//                     break;
//                 case 'is':
//                     result = contextValue.toString() === conditionValue;
//                     break;
//                 case 'in':
//                     if (typeof contextValue === 'string' || Array.isArray(contextValue)) {
//                         result = contextValue.includes(conditionValue);
//                     } else {
//                         console.error("Cannot use 'in' operator on non-string/array context value:", contextValue);
//                         result = false;
//                     }
//                     break;
//                 case 'not':
//                     if (typeof contextValue === 'string' || Array.isArray(contextValue)) {
//                         result = !contextValue.includes(conditionValue);
//                     } else {
//                         console.error("Cannot use 'not' operator on non-string/array context value:", contextValue);
//                         result = false;
//                     }
//                     break;
//                 default:
//                     console.error("Unsupported operator:", operator);
//                     result = false;
//                     break;
//             }
//             console.log("Condition evaluation result:", result);    
//             results.push(result);
//         }
//     });
    
//     console.log("Condition evaluation results:", results);
//     return results;
// }


// async function execute(parsed) {
//     console.log("Executing rule:");
//     //console.log("Executing", parsed);
//     const currentActivity = await getCurrentActivity();
//     const currentSeason = await getCurrentSeason();

//     //console.log("Current Activity:", currentActivity);
//     //console.log("Current Season:", currentSeason);

//     // Mock data to replace emitter.on event
//     const LivingRoom = {
//         motionState: true, // or 'not detected'
//         roomName: 'Living Room',
//         roomid: '38197016',
//         space_id: '61097711',
//         name_space : "SmartHome"
//     };

//     const bathroom = {
//         motionState: false, // or 'not detected'
//         roomName: 'bathroom',
//         roomid: '61097711-4866',
//         space_id: '61097711',
//         name_space: "SmartHome",
//         icon: "bath"
//     };

//     const ClassRoom = {
//         motionState: false, // or 'not detected'
//         roomName: 'Class246',
//         roomid: '67822610-8768',
//         space_id: '67822610',
//         name_space: "SmartSchool",
//         icon: "ClassRoom"
//     };
    
    

   

//     const context = {
//         detection : LivingRoom.motionState,
//         //detection: mockData.motionState,
//         // activity: currentActivity,
//         // season: currentSeason,
//         activity: 'studying',
//         season: 'spring',
//         roomName: LivingRoom.roomName,
//         roomid: LivingRoom.roomid,
//         space_id: LivingRoom.space_id,
//     };

//     // Get the room ID before you fetch devices
//     let { roomName, roomDetails } = await GetRoomNameFromDatabase(parsed.conditions[0]);
    

//     if (!roomDetails) {
//         console.error("Failed to fetch the room ID");
//         return;
//     }

//     const roomDevicesResult = await getDevicesByRoomId(roomDetails.id);
//     if (roomDevicesResult.statusCode !== 200) {
//         console.error("Failed to fetch room devices:", roomDevicesResult.message);
//         return;
//     }
//     const roomdevices = roomDevicesResult.data;

//     //console.log('Fetched room devices:', JSON.stringify(roomdevices, null, 2));
//     const evaluationConditionResult = evaluateCondition(parsed, context);
//     const convertedOperatorsCondition = convertOperators(parsed.specialOperators.condition_operators);
//     const result = evaluateLogic(evaluationConditionResult, convertedOperatorsCondition);
//     console.log("Result of condition evaluation:", result);
   
//     if (!result) {
//         console.log("Conditions not met, no actions executed.");
//         return;
//     }

//     if (context.roomName.toLowerCase() === roomName.toLowerCase()) {
//         for (const action of parsed.actions) {
//             try {
//                 console.log("Executing action:", action);
//                 const commandExecuted = await CommandFactory.createCommand(action, roomDetails.id, roomdevices, roomName);
//                 if (commandExecuted) {
//                     console.log("Command " + commandExecuted + "successfully executed.");
//                 } else {
//                     console.log('Action could not be executed:', action);
//                 }
//             } catch (error) {
//                 console.error("Error during execution:", error);
//             }
//         }
//     } else {
//         console.log("Room name not matched or undefined. No actions executed.");
//     }


//     if (parsed.conditions.length === 0) {
//         console.log('No conditions provided.');
//     }
//     if (parsed.actions.length === 0) {
//         console.log('No actions provided.');
//     }
// }
>>>>>>> Stashed changes
