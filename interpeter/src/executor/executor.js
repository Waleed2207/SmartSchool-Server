const { forEach } = require('lodash');
const {CommandFactory} = require('../factories/commandFactory');

// import {CommandFactory} from '../factories/commandFactory';




function evaluateCondition(parsed , context) 
{
    
  
    
    const variablePattern = /\b(detection|temperature)\b/gi;
    const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|or|and)\b/gi;
    const valuePattern = /\b(\d{1,3}|ON|OFF|True|False|true|false)\b/gi;
   
    

    let results = [];  // This array will store the results of each condition evaluation

   
    
    parsed.conditions.forEach((condition, index) => {
        
      

        // Extracting variable, operator, and value using regex
        const variableMatch = condition.match(variablePattern);
        const operatorMatch = condition.match(operatorPattern);
        const valueMatch = condition.match(valuePattern);

        if (!variableMatch || !operatorMatch || !valueMatch) {
            console.error('Error parsing condition:', condition);
            results.push(false);
            return; // Continue to next iteration in forEach
        }

        const variable = variableMatch[0].toLowerCase();
        const operator = operatorMatch[0].toLowerCase().trim();
        const conditionValue = valueMatch[0].toLowerCase();
        const varValue  = context[variable];

        /*
        if (typeof context[variable] === 'boolean') {
            // Convert boolean to 1 or 0
            varValue = context[variable] ? 1 : 0;
        } else if (typeof context[variable] === 'number') {
            varValue = context[variable];
        } else {
            // Handle other cases or throw an error
            console.error(`Unsupported type for variable: ${variable}`);
        }
        */

        console.log("Variable : " + variable)
        console.log("operator : " + operator)
        console.log("conditionValue : " +  conditionValue)
        console.log("varValue : " +  varValue)

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
        
    });

    
 

   

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
    
    console.log("Conditions:", parsed.conditions);
    console.log("Actions:", parsed.actions);
    console.log("Special Operators:", parsed.speicaloperators);
     
    
    if (parsed.conditions.length > 0  && parsed.actions.length > 0  ) {


        if (evaluateCondition(parsed, context)) 
        {
    
            console.log(`Condition met, executing action: ${parsed.action}`);
            
           
            if (!parsed.action) {
                console.log('Parsed action is undefined. Check the parsing logic.');
                return;
            }
            //check this becuse i dont think is ok 
            /*
            const command = CommandFactory.createCommand(parsed.action);
            */
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
        
        if(parsed.condition.length === 0)
        {
            console.log('parsed condition lenght :', parsed.condition.length );
        }
        else{

            console.log('parsed Action lenght :', parsed.action.length );    
        }

        
    }
}


// Example of a new condition evaluation logic





module.exports = { execute };
