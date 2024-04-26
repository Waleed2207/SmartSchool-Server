const { forEach } = require('lodash');
const {CommandFactory} = require('../factories/commandFactory');
const { debug } = require('console');

// import {CommandFactory} from '../factories/commandFactory';


// function evaluateCondition(parsed, context) {
//     const structuredVariablePattern = /\b(detection|temperature|activity|season)\b/gi;
//     const naturalLanguagePattern = /(?:he|the)\s+(activity|season|he)\s+is\s+(\w+)/i;
//     const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is)\b/gi;
//     const valuePattern = /\b(\d{1,3}|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping)\b/gi;

//     let results = [];

//     console.log("Current context:", context);

//     parsed.conditions.forEach((condition) => {
//         let naturalMatch = condition.match(naturalLanguagePattern);
//         if (naturalMatch) {
//             let variable = naturalMatch[1].toLowerCase();
//             let expectedValue = naturalMatch[2].toLowerCase();
//             if (context.hasOwnProperty(variable) && context[variable].toString().toLowerCase() === expectedValue) {
//                 results.push(true);
//             } else {
//                 results.push(false);
//             }
//             return;
//         }

//         const variableMatch = condition.match(structuredVariablePattern);
//         const operatorMatch = condition.match(operatorPattern);
//         const valueMatch = condition.match(valuePattern);

//         if (!variableMatch || !operatorMatch || !valueMatch) {
//             console.error('Error parsing structured condition:', condition);
//             results.push(false);
//             return;
//         }

//         const variable = variableMatch[0].toLowerCase();
//         const operator = operatorMatch[0].toLowerCase().trim();
//         const conditionValue = valueMatch[0].toLowerCase();
//         const contextValue = context.hasOwnProperty(variable) ? context[variable].toString().toLowerCase() : null;

//         if (contextValue === null) {
//             console.warn(`Warning: Missing context value for variable '${variable}'.`);
//             results.push(false);
//             return;
//         }

//         switch (operator) {
//             case 'is above':
//                 results.push(parseFloat(contextValue) > parseFloat(conditionValue));
//                 break;
//             case 'is below':
//                 results.push(parseFloat(contextValue) < parseFloat(conditionValue));
//                 break;
//             case 'is equal to':
//             case 'is':  // Treat 'is' as an alias for 'is equal to'
//                 results.push(contextValue === conditionValue);
//                 break;
//             case 'is above or equal to':
//                 results.push(parseFloat(contextValue) >= parseFloat(conditionValue));
//                 break;
//             case 'is below or equal to':
//                 results.push(parseFloat(contextValue) <= parseFloat(conditionValue));
//                 break;
//             default:
//                 console.error(`Unknown operator: ${operator}`);
//                 results.push(false);
//                 break;
//         }
//     });

//     return results;
// }


// function evaluateCondition(parsed, context) {
//     const structuredVariablePattern = /\b(Joe|detection|temperature|activity|season)\b/gi;
//     const naturalLanguagePattern = /(?:he|the)\s+(activity|season)\s+is\s+(\w+|in)/i;  // Removed "he" from capture group
//     const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in)\b/gi;
//     const valuePattern = /\b(\d{1,3}|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping|room 247)\b/gi;

//     let results = [];
//     console.log("Evaluating conditions with the context:", context);

//     parsed.conditions.forEach((condition) => {
//         let naturalMatch = condition.match(naturalLanguagePattern);
//         if (naturalMatch) {
//             let variable = naturalMatch[1].toLowerCase();
//             let expectedValue = naturalMatch[2].toLowerCase();
//             let contextValue = context.hasOwnProperty(variable) ? context[variable].toString().toLowerCase() : undefined;
//             results.push(contextValue === expectedValue);
//             console.log(`Natural language condition parsed: ${variable} should be ${expectedValue}, result: ${contextValue === expectedValue}`);
//             return;
//         }

//         const variableMatch = condition.match(structuredVariablePattern);
//         const operatorMatch = condition.match(operatorPattern);
//         const valueMatch = condition.match(valuePattern);

//         if (!variableMatch || !operatorMatch || !valueMatch) {
//             console.error('Error parsing structured condition:', condition);
//             results.push(false);
//             return;
//         }

//         const variable = variableMatch[0].toLowerCase();
//         const operator = operatorMatch[0].toLowerCase().trim();
//         const conditionValue = valueMatch[0].toLowerCase();
//         const contextValue = context.hasOwnProperty(variable) ? context[variable].toString().toLowerCase() : null;

//         console.log(`Structured condition parsed: ${variable} ${operator} ${conditionValue}`);

//         if (contextValue === null) {
//             console.warn(`Warning: Missing context value for variable '${variable}'.`);
//             results.push(false);
//             return;
//         }

      
//         switch (operator) {
//             case 'is above':
//                 results.push(parseFloat(contextValue) > parseFloat(value));
//                 break;
//             case 'is below':
//                 results.push(parseFloat(contextValue) < parseFloat(value));
//                 break;
//             case 'is equal to':
//             case 'is':  // Treat 'is' as an alias for 'is equal to'
//                 results.push(contextValue === value);
//                 break;
//             case 'is above or equal to':
//                 results.push(parseFloat(contextValue) >= parseFloat(value));
//                 break;
//             case 'is below or equal to':
//                 results.push(parseFloat(contextValue) <= parseFloat(value));
//                 break;
//             case 'in':  // Checks if the context value contains the given substring or one of the items
//                 // If you need to handle it as a substring contains
//                 results.push(contextValue.includes(value));
//                 // If you need it as one of the many, assuming value is a comma-separated string
//                 // const possibleValues = value.split(',');
//                 // results.push(possibleValues.includes(contextValue));
//                 break;
//             default:
//                 console.error(`Unknown operator: ${operator}`);
//                 results.push(false);
//                 break;
//         }
//     });

//     return results.every(Boolean);
// }


function evaluateCondition(parsed, context) {
    const structuredVariablePattern = /\b(Joe|detection|temperature|activity|season)\b/gi;
    const unaryConditionPattern = /^\s*(studying|eating|sleeping)\s*$/i;  // Pattern to catch unary conditions
    const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in)\b/gi;
    const valuePattern = /\b(\d{1,3}|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping|room 247)\b/gi;

    let results = [];
    console.log("Evaluating conditions with the context:", context);

    parsed.conditions.forEach((condition) => {
        let naturalMatch = condition.match(unaryConditionPattern);
        if (naturalMatch) {
            let variable = naturalMatch[1].toLowerCase();
            let contextValue = context.hasOwnProperty(variable) ? context[variable] : undefined;  // Changed to direct context access
            let expectedValue = true;  // Assume that unary conditions are meant to check for a truthy value
            results.push(Boolean(contextValue) === expectedValue);  // Check for truthiness
            console.log(`Unary condition parsed: ${variable}, expected to be truthy, result: ${Boolean(contextValue) === expectedValue}`);
            return;
        }

        const variableMatch = condition.match(structuredVariablePattern);
        const operatorMatch = condition.match(operatorPattern);
        const valueMatch = condition.match(valuePattern);

        if (!variableMatch || !operatorMatch || !valueMatch) {
            console.error('Error parsing structured condition:', condition);
            results.push(false);
            return;
        }

        const variable = variableMatch[0].toLowerCase();
        const operator = operatorMatch[0].toLowerCase().trim();
        const conditionValue = valueMatch[0].toLowerCase();
        const contextValue = context.hasOwnProperty(variable) ? context[variable].toString().toLowerCase() : null;

        console.log(`Structured condition parsed: ${variable} ${operator} ${conditionValue}`);

        if (contextValue === null) {
            console.warn(`Warning: Missing context value for variable '${variable}'.`);
            results.push(false);
            return;
        }

        switch (operator) {
            case 'is above':
                results.push(parseFloat(contextValue) > parseFloat(conditionValue));
                break;
            case 'is below':
                results.push(parseFloat(contextValue) < parseFloat(conditionValue));
                break;
            case 'is equal to':
            case 'is':  // Treat 'is' as an alias for 'is equal to'
                results.push(contextValue === conditionValue);
                break;
            case 'is above or equal to':
                results.push(parseFloat(contextValue) >= parseFloat(conditionValue));
                break;
            case 'is below or equal to':
                results.push(parseFloat(contextValue) <= parseFloat(conditionValue));
                break;
            case 'in':  // Checks if the context value contains the given substring or matches one of a list
                results.push(contextValue.includes(conditionValue));
                break;
            default:
                console.error(`Unknown operator: ${operator}`);
                results.push(false);
                break;
        }
    });

    return results.every(Boolean);  // Returns true only if all conditions are true
}



/*

// Modify your execute function or similar to handle the new rule
function DedectionEvaluat({variable, operator, value } ,context) {

    console.log("evaluateConditioDedection");
    
    let TempValue = parseInt(value);
    console.log({variable});
    console.log({operator});
    console.log({value});
    if(variable == 'detection' &&  operator == 'is equal to ' && value == '1')
    {
        console.log("evaluateConditioDedection it ok");
        return true;
    }else
    {
        if(variable =! 'detection')
        {
            console.log("problem with variable!!!!!!!!!!!!!!");

        }
        if(operator =! 'is equal to')
        {
            console.log("problem with operator&&&&&&&&&&&&&&&&");
        }
        else 
        {
            console.log("problem with value!!!!!!!!!!!!!!!");
        }
        console.log("evaluateConditioDedection it not ok")
        return false;
    }
}

*/
function convertOperators(operators) {
    const operatorMap = {
        'and': '&&',
        'or': '||'
    };

    return operators.map(op => operatorMap[op.toLowerCase()] || op);
}

// function evaluateLogic(results, operators) {
//     let currentValue = results[0];
//     for (let i = 0; i < operators.length; i++) {
//         const nextValue = results[i + 1];
//         switch (operators[i].toLowerCase()) {
//             case 'and':
//                 currentValue = currentValue && nextValue;
//                 break;
//             case 'or':
//                 currentValue = currentValue || nextValue;
//                 break;
//             default:
//                 console.error(`Unsupported operator: ${operators[i]}`);
//                 return false;
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



// function execute(parsed, context) {
    
//     console.log("Conditions:", parsed.conditions);
//     console.log("Actions:", parsed.actions);
//     console.log("Special Operators:", parsed.Speical_operators);
     
    
//     if (parsed.conditions.length > 0  && parsed.actions.length > 0  ) {

        
//         const evaluation_condtion_result  = evaluateCondition(parsed, context);
//         const convertedOperators_Condition = convertOperators(parsed.Speical_operators.condition_operators);
//         console.log("convertedOperators_Condition : " + convertedOperators_Condition)
//         const result = evaluateLogic(evaluation_condtion_result,convertedOperators_Condition)
        
//         console.log("result is " + result);

//         if (result) 
//         {
    
//             console.log(`Condition met, executing action: ${parsed.action}`);
            
           
//             if (!parsed.action) {
//                 console.log('Parsed action is undefined. Check the parsing logic.');
//                 return;
//             }
//             //check this becuse i dont think is ok 
//             /*
//             const command = CommandFactory.createCommand(parsed.action);
//             */
//             /*i change i dont think i need that 
//             console.log()
//             if (command) {
//                 console.log("command.execute()");
//                 command.execute();
//             } else {
//                 console.log('Action could not be executed:', parsed.action);
//                 // Add additional logging here to help with debugging
//                 console.log('CommandFactory returned undefined or null for the action.');
//             }
//             */
//         } else {
//             console.log(`Condition not met, action not executed.`);
//         }
       
//     } else {
        
//         if(parsed.condition.length === 0)
//         {
//             console.log('parsed condition lenght :', parsed.condition.length );
//         }
//         else{

//             console.log('parsed Action lenght :', parsed.action.length );    
//         }

        
//     }
// }

function execute(parsed, context) {
    console.log("Received parsed object:", JSON.stringify(parsed, null, 2));

    if (!parsed || !parsed.specialOperators || !parsed.specialOperators.condition_operators) {
        console.error("Error: Missing 'specialOperators' or 'condition_operators' in the parsed object.");
        return;
    }

    console.log("Executing with conditions:", parsed.conditions);
    console.log("Actions:", parsed.actions);
    console.log("Condition Operators:", parsed.specialOperators.condition_operators);

    const evaluationConditionResult = evaluateCondition(parsed, context);
    const logicalOperators = convertOperators(parsed.specialOperators.condition_operators);
    const result = evaluateLogic(evaluationConditionResult, logicalOperators);

    if (result) {
        parsed.actions.forEach(action => {
            console.log(`Condition met, executing action: ${action}`);
            // Implement the action execution logic here
        });
    } else {
        console.log("Conditions not met, no actions executed.");
    }
}


// Example of a new condition evaluation logic





module.exports = { execute };
