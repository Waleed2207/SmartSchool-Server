const {CommandFactory} = require('../factories/commandFactory');




function evaluateCondition({ variable, operator, value }, context) {
    console.log(`Evaluating condition: ${variable} ${operator} ${value}`);
    console.log("evaluateConditioDedection checkkkkkkkkkkkkkkkkkkkkkkkkkkk");
    
    let TempValue = parseInt(value);
    console.log({variable});
    console.log({operator});
    console.log({value});
    const varValue = parseFloat(context[variable]);
    const conditionValue = parseFloat(value);

    console.log("evaluateConditioDedection check");

    if (variable === 'detection' && operator === 'is equal to' && conditionValue === 1 ) {
        console.log("evaluateConditioDedection it ok");
        return true;
    } else {
        if (variable !== 'detection') {
            console.log("problem with variable!!!!!!!!!!!!!!");
        }
        if (operator !== 'is equal to') {
            console.log("problem with operator&&&&&&&&&&&&&&&&");
        }
        if (value !== '1') {
            console.log("problem with value++++++++++++++++++++++++");
        }
        console.log("evaluateConditioDedection it not ok")
        return false;
    }
    
    

    
   

    console.log({varValue})
    console.log({conditionValue});

    

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


// Modify your execute function or similar to handle the new rule
function DedectionEvaluat({variable, operator, value } ,context) {

    console.log("evaluateConditioDedection checkkkkkkkkkkkkkkkkkkkkkkkkkkk");
    
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


function execute(parsed, context) {
    
    if (parsed.condition && parsed.condition.operator) {
        if (evaluateCondition(parsed.condition, context) || DedectionEvaluat(parsed.condition, context) ) {
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


// Example of a new condition evaluation logic





module.exports = { execute };
