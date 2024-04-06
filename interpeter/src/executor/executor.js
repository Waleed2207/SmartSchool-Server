const {CommandFactory} = require('../factories/commandFactory');


function evaluateCondition({ variable, operator, value }, context) {
    console.log(`Evaluating condition: ${variable} ${operator} ${value}`);
    
    const variablePattern = /\bdetection|temperature\b/i;
    const operatorPattern = /\bis above|is below|is equal to|is above or equal to|is below or equal to|or|and\b/i;
    const valuePattern = /\b(\d{1,3}|ON|OFF)\b/i; // Assuming value can be a number potentially followed by °C

    const variableMatch = action.match(variablePattern);
    const operatorMatch = action.match(operatorPattern);
    const valueMatch = action.match(valuePattern);

    const variableType = variableMatch ? variableMatch[0].trim() : '';
    const operatorType = operatorMatch ? operatorMatch[0].trim().toLowerCase() : '';
    const valueType = valueMatch ? valueMatch[0].trim() : '';
    
    console.log("variable: " + variableType );
    console.log("operator " + operatorType );
    console.log("value :" + valueType );
    
    switch (opertatortype) {
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



function execute(parsed, context) {
    if (parsed.condition && parsed.condition.operator) {
        if (evaluateCondition(parsed.condition, context) ) 
        {
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
    }
}


module.exports = { execute };
