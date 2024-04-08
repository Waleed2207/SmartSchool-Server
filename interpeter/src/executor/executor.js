const {CommandFactory} = require('../factories/commandFactory');

// import {CommandFactory} from '../factories/commandFactory';




function evaluateCondition({ variable, operator, value }, context) 
{
    console.log({context});
    console.log(`Evaluating condition: ${variable} ${operator} ${value}`);
<<<<<<< HEAD
    console.log(1)
    const variablePattern = /\bdetection|temperature\b/i;
    const operatorPattern = /\bis above|is below|is equal to|is above or equal to|is below or equal to|or|and\b/i;
    const valuePattern = /\b(\d{1,3}|ON|OFF)\b/i; // Assuming value can be a number potentially followed by °C

    const variableMatch = variable.match(variablePattern);
    const operatorMatch = operator.match(operatorPattern);
    const valueMatch = value.match(valuePattern);
    
    const variableType = variableMatch ? variableMatch[0].trim() : '';
    const operatorType = operatorMatch ? operatorMatch[0].trim().toLowerCase() : '';
    const conditionValue = valueMatch ? valueMatch[0].trim() : '';
    const varValue = parseFloat(context[variable]);
    
    console.log(conditionValue)
    
    console.log("variable: " + variableType );
    console.log("operator : " + operatorType );
    console.log("value :" + varValue );
    
    switch (operatorType) {
=======
    console.log("we check evaluateConditioDedection");
    
    let TempValue = parseInt(value);
    console.log(`variable: ${variable} , opraotor: ${operator} , Value : ${value}`);
    const varValue = parseFloat(context[variable]);
    const conditionValue = parseFloat(value);


    /*
    if (variable === 'detection' && operator === 'is equal to' && conditionValue === 1 ) 
    {
        console.log("evaluateConditioDedection it ok");
        return true;
    } 
    */
    

    //console.log({varValue})
    //console.log({conditionValue});

    

    switch (operator) 
    {
>>>>>>> origin/SameerDevNew
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


function execute(parsed, context) {
    
    console.log("execute");
    if (parsed.condition && parsed.condition.operator) {
<<<<<<< HEAD
        if (evaluateCondition(parsed.condition, context) ) 
        {
=======
        if (evaluateCondition(parsed.condition, context)  ) {
>>>>>>> origin/SameerDevNew
            console.log(`Condition met, executing action: ${parsed.action}`);
            console.log(parsed.action);
            // Check if the action is defined
            if (!parsed.action) {
                console.log('Parsed action is undefined. Check the parsing logic.');
                return;
            }
            
            const command = CommandFactory.createCommand(parsed.action);
            if (command) {
                console.log("command.execute()");
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


// Example of a new condition evaluation logic





module.exports = { execute };
