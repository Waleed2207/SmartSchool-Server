const { forEach } = require('lodash');
const {CommandFactory} = require('../factories/commandFactory');
const { debug } = require('console');
const { getCurrentActivity, getCurrentSeason } = require('../../../services/time.service');


// import {CommandFactory} from '../factories/commandFactory';
function evaluateCondition(parsed, context) {
    const structuredVariablePattern = /\b(detection|temperature|activity|season)\b/gi;
    const naturalLanguagePattern = /(?:he|the)\s+(activity|season|he)\s+is\s+(\w+)/i;
    const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is)\b/gi;
    const valuePattern = /\b(\d{1,3}|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping)\b/gi;

    let results = [];

    console.log("Current context:", context);

    parsed.conditions.forEach((condition) => {
        let naturalMatch = condition.match(naturalLanguagePattern);
        if (naturalMatch) {
            let variable = naturalMatch[1].toLowerCase();
            let expectedValue = naturalMatch[2].toLowerCase();
            if (context.hasOwnProperty(variable) && context[variable].toString().toLowerCase() === expectedValue) {
                results.push(true);
            } else {
                results.push(false);
            }
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
            default:
                console.error(`Unknown operator: ${operator}`);
                results.push(false);
                break;
        }
    });

    return results;
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

function evaluateLogic(results, operators) {
    console.log("IN (evaluate logic) Function");

    if (results.length - 1 !== operators.length) {
        throw new Error("The number of operators should be one less than the number of results.");
    }


    let currentValue = results[0] === 'true';  // Start with the first result

    for (let i = 0; i < operators.length; i++) {
        const nextValue = results[i + 1] === 'true';
        switch (operators[i]) {
            case '&&':
                currentValue = currentValue && nextValue;
                break;
            case '||':
                currentValue = currentValue || nextValue;
                break;
            default:
                throw new Error(`Unsupported operator: ${operators[i]}`);
        }
    }

    return currentValue;
}

function execute(parsed, context) {
    console.log("Conditions:", parsed.conditions);
    console.log("Actions:", parsed.actions);
    console.log("Special Operators:", parsed.Special_operators);

    // Correct typo and ensure property presence
    if (!parsed.Special_operators || !parsed.Special_operators.condition_operators) {
        console.error('Special Operators data is missing or malformed.');
        return;
    }

    const evaluation_condition_result = evaluateCondition(parsed, context);
    const convertedOperators_Condition = convertOperators(parsed.Special_operators.condition_operators);
    const result = evaluateLogic(evaluation_condition_result, convertedOperators_Condition);

    console.log("Result of conditions:", result);

    if (result) {
        parsed.actions.forEach(action => {
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



module.exports = { execute };
