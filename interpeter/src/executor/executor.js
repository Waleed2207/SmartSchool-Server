const {CommandFactory} = require('../factories/commandFactory');

// import {CommandFactory} from '../factories/commandFactory';




function evaluateCondition({ variables, operators , values }, context) 
{
    console.log("Context:", JSON.stringify(context));
    console.log(`Type of context[${context}]:`, typeof context[variable], `, Value:`, context[variable]);
    //console.log(`Evaluating condition: ${variable} ${operator} ${value}`);
    console.log("try1");
    console.log(`Evaluating condition: ${ variables} , ${operators} , ${values} `);

   

    
    // Log all values after filling each array
    console.log(`Variables collected: ${variables.join(', ')}`);
    console.log(`Operators collected: ${operators.join(', ')}`);
    console.log(`Values collected: ${values.join(', ')}`);
 
    const variableMatch = variable.match(variablePattern);
    const operatorMatch = operator.match(operatorPattern);
    const valueMatch = value.match(valuePattern);
    
    const variableType = variableMatch ? variableMatch[0].trim() : '';
    const operatorType = operatorMatch ? operatorMatch[0].trim().toLowerCase() : '';
    const conditionValue = valueMatch ? valueMatch[0].trim() : '';
    let varValue;
    
    console.log("condition value : ",conditionValue) 
    console.log("variable: " + variableType );
    console.log("operator : " + operatorType );
    console.log("Condtionvalue :" + conditionValue );
    console.log("varvalue : " + varValue)
    
    
    
     // Log all values after filling each array
     console.log(`Variables collected: ${variables.join(', ')}`);
     console.log(`Operators collected: ${operators.join(', ')}`);
     console.log(`Values collected: ${values.join(', ')}`);
   
    if (typeof context[variable] === 'boolean') {
        // Convert boolean to 1 or 0
        varValue = context[variable] ? 1 : 0;
    } else if (typeof context[variable] === 'number') {
        // Use the number directly
        varValue = context[variable];
    } else {
        // Handle other cases or throw an error
        console.error(`Unsupported type for variable: ${variable}`);
    }

    
    

    

  
    
    switch (operator) 
    {
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


        if (evaluateCondition(parsed.condition, context)  ) 
        {
    
            console.log(`Condition met, executing action: ${parsed.action}`);
            console.log(parsed.action);
            // Check if the action is defined
            if (!parsed.action) {
                console.log('Parsed action is undefined. Check the parsing logic.');
                return;
            }
            //check this becuse i dont think is ok 
            const command = CommandFactory.createCommand(parsed.action);
            /*i change i dont think i need that 
            console.log()
            if (command) {
                console.log("command.execute()");
                command.execute();
            } else {
                console.log('Action could not be executed:', parsed.action);
                // Add additional logging here to help with debugging
                console.log('CommandFactory returned undefined or null for the action.');
            }
            */
        } else {
            console.log(`Condition not met, action not executed.`);
        }
       
    } else {
        console.log('Invalid condition structure:', parsed.condition);
    }
}


// Example of a new condition evaluation logic





module.exports = { execute };
