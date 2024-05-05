const { forEach, cond, result } = require('lodash');
const {CommandFactory} = require('../factories/commandFactory');
const { debug, Console } = require('console');
const {SpecialDictionary} = require('./Dictionsry');
const myDict = require('./Dictionsry');
const { getRooms,getRoomById,getRoomIdByRoomName,get_Rooms_By_SpaceId,getRoomByName,getAllRoomIds,getAllRoomNames} = require('../../../services/rooms.service');  
const { getCurrentActivity, getCurrentSeason } = require('../../../services/time.service');


function convertOperators(operators) {
    const operatorMap = {
        'and': '&&',
        'or': '||'
    };

    return operators.map(op => operatorMap[op.toLowerCase()] || op);
}

// function evaluateLogic(results, operators) {


//     if (results.length - 1 !== operators.length) {
//         throw new Error("The number of operators should be one less than the number of results.");
//     }

//     if(operators.length == 0 )
//     {
//         return results[0];

//     }

//     let currentValue = results[0] ;  
   
//     for (let i = 0; i < operators.length; i++) {
//         const nextValue = results[i + 1];
//         switch (operators[i]) {  // Removed toLowerCase() as we're using symbols, not words
//             case '&&':  // Using symbol for AND  
//                 currentValue = currentValue && nextValue;
//                 console.log("currentValue : " + currentValue )
//                 break;
//             case '||':  // Using symbol for OR
//                 currentValue = currentValue || nextValue;
//                 break;
//             default:
//                 console.error(`Unsupported operator: ${operators[i]}`);
//                 return false;
//         }
//     }
//     console.log("currentValue" + currentValue )
//     return currentValue;
// }



// function evaluateLogic(results, operators) {
//     if (results.length - 1 !== operators.length) {
//         console.error(`Mismatch in the number of results and operators: Results Length=${results.length}, Operators Length=${operators.length}`);
//         throw new Error("The number of operators should be one less than the number of results.");
//     }

//     let currentValue = results[0];
//     for (let i = 0; i < operators.length; i++) {
//         const nextValue = results[i + 1];
//         switch (operators[i]) {
//             case '&&': currentValue = currentValue && nextValue; break;
//             case '||': currentValue = currentValue || nextValue; break;
//             default: console.error(`Unsupported operator: ${operators[i]}`); return false;
//         }
//     }
//     return currentValue;
// }



// function evaluateLogic(results, operators) {
//     if (results.length - 1 !== operators.length) {
//         console.error(`Mismatch in the number of results and operators: Results Length=${results.length}, Operators Length=${operators.length}`);
//         throw new Error("The number of operators should be one less than the number of results.");
//     }

//     let currentValue = results[0];
//     for (let i = 0; i < operators.length; i++) {
//         const nextValue = results[i + 1];
//         switch (operators[i]) {
//             case '&&': currentValue = currentValue && nextValue; break;
//             case '||': currentValue = currentValue || nextValue; break;
//             default: console.error(`Unsupported operator: ${operators[i]}`); return false;
//         }
//     }
//     return currentValue;
// }


function evaluateLogic(results, operators) {
    let currentValue = results[0];
    for (let i = 0; i < operators.length; i++) {
        const nextValue = results[i + 1];
        switch (operators[i]) {  // Removed toLowerCase() as we're using symbols, not words
            case '&&':  // Using symbol for AND
                currentValue = currentValue && nextValue;
                break;
            case '||':  // Using symbol for OR
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
    const activities = ['studying', 'cooking', 'eating', 'playing', 'watching_tv', 'sleeping'];
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    const words = sentence.toLowerCase().split(/\s+/);
    console.log("get context type words:");
    for (const word of words) {
        if (activities.includes(word)) {
            if (context['activity'] === word) { // Use quotes around 'activity'
                console.log("Activity matched:", word);
                return true;
            } else {
                console.log("Activity not matched:", word);
                return false;
            }
        } else if (seasons.includes(word)) {
            if (context['season'] === word) { // Use quotes around 'season'
                console.log("Season matched:", word);
                return true;
            } else {
                console.log("Season not matched:", word);
                return false;
            }
        }
    }
    return null;
}

   
    
 


function evaluateCondition(parsed, context) {
  
    console.log("Evaluating conditions...");
    const structuredVariablePattern = /\b(in room|detection|temperature|activity|season)\b/gi;
    const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in|not)\b/gi;
    const valuePattern = /\b(\d+|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping)\b/gi;
    
    let results = [],result = null;
    parsed.conditions.forEach(condition => {
        // console.log("Processing condition:", condition);
       
        if(myDict.check(condition))
        {
            condition = myDict.getValue(condition); 
        }
        result = getContextType(condition, context);
        if(result !== null)
        {
            results.push(result);
            return;
        }
        else
        {
            console.log("result is null");   
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

            // Ensure contextValue is valid for operation
            if (contextValue === undefined) {
                console.error("Context value is undefined for variable:", variable);
                results.push(false);
                return;
            }

            // Convert boolean strings to boolean values
            if (conditionValue === "true | True" || conditionValue === "false | False") {
                Boolean(conditionValue);
            }

            // console.log("variable: ", variable, " operator: ", operator, " conditionValue: ", conditionValue);
            // console.log("contextValue: ", contextValue, " conditionValue: ", conditionValue);

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
            console.log("Condition evaluation result:", result);    
            results.push(result);
        }
    });
    
    console.log("Condition evaluation results:", results);
    return results;
}





async function CallRoom(parsed) {
    try {
        //console.log("Getting room IDs and details");
        const roomIDs = await getAllRoomIds(); // Await the promise to get room IDs
        //console.log("Room IDs:", roomIDs);
        const roomIDpatternString = roomIDs.map(id => id.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const roomIDPattern = new RegExp(`(${roomIDpatternString})`, 'gi');
        //console.log("Room ID pattern:", roomIDPattern); 

        // Check if parsed object and its conditions property are defined and not empty
        if (parsed && parsed.length > 0) {
            const roomIdMatch = parsed.match(roomIDPattern); // Extract the room ID match
            if (roomIdMatch) {
                const roomId = roomIdMatch[0]; // Assuming the first match is the room ID
                const room = await getRoomById(roomId); // Call getRoomById with the room ID
                //console.log("Call Room details:", JSON.stringify(room, null, 2));
                return room;
            } else {
                console.log("No room ID found in the parsed string.");
                throw new Error("No room ID found in the parsed string.");
            }
        } else {
            console.log("Parsed object or its conditions property is undefined or empty.");
            throw new Error("Parsed object or its conditions property is undefined or empty.");
        }
    } catch (err) {
        console.log("Error in getting room IDs or room details:", err);
        // Return null or handle the error as appropriate
        return null;
    }
}






async function execute(parsed) {
    // console.log("Executing parsed conditions and actions"); 
    // console.log("Conditions :", parsed.conditions);
    // console.log("Actions:", parsed.actions);
    // console.log("SpecialOperators condtion operators:", parsed.specialOperators.condition_operators);



    
    const currentActivity = getCurrentActivity();
    const currrentSeason = getCurrentSeason();
//    const data = await getSensiboSensors();
//    console.log("Data from Sensibo:", data);
    // const detection = false;
    const context = {
        //current_room: room.data, 
        detection: false,
        //temperature: data.temperature,
        //humidity: data.humidity,
        activity: currentActivity,
        //activity: "studying",
        // season: "spring",
        season: currrentSeason,
    }

   // console.log("The Context is :", current_room, currrentSeason, detection, activity,season);
    const evaluation_condition_result = evaluateCondition(parsed, context);
   

    const convertedOperators_Condition = convertOperators(parsed.specialOperators.condition_operators);
   

    const result = evaluateLogic(evaluation_condition_result, convertedOperators_Condition);
 
   // console.log("Result of conditions:", result);
   const room =  await CallRoom(parsed.conditions[0]); 
   //console.log("execute Get Room details:", JSON.stringify(room, null, 2));
    if(result === false){
        console.log("Conditions not met, no actions executed.");
        return;
    }else{
        console.log("Conditions met, executing actions.");  
    }

    if (result) {
        parsed.actions.forEach(action => {
            //console.log("Current action being processed:", action);
           
            
            const command = CommandFactory.createCommand(action,room);
            if (command) {
                console.log("command was execute");
            } else {
                console.log('Action could not be executed:', action);
            }
            console.log(`Executing action: ${action}`);
            // Execution code here
        });
    } else {
        console.log("Conditions not met, no actions executed.");
    }

    if (parsed.conditions.length === 0) {
        console.log('No conditions provided.');
    }
    if (parsed.actions.length === 0) {
        console.log('No actions provided.');
    }
}



module.exports = { execute  } ;
