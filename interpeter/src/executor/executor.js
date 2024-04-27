const { forEach, cond } = require('lodash');
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

        if (!variableMatch || !operatorMatch || !valueMatch) {
            console.error('Error parsing structured condition:', condition);
            results.push(false);
            return;
        }
        console.log("1");
        const variableMatch = condition.match(structuredVariablePattern);
        const naturalMetch =  condition.match(naturalLanguagePattern);
        const operatorMatch = condition.match(operatorPattern);
        const valueMatch = condition.match(valuePattern);
        
        console.log("2");
        let variable = variableMatch[0].toLowerCase();
        let natural = naturalMetch[0].toLowerCase();
        let operator = operatorMatch[0].toLowerCase().trim();
        let conditionValue = valueMatch[0].toLowerCase();
        let varValue  = context[variable];

        
        if ( conditionValue === 'on' ) {
            conditionValue = true;
        }

        // Check for 'false', 'off', or '0' to return false
        if (conditionValue === 'off' ) {
            condition = false;
        }
        Number(conditionValue,varValue)

        console.log("conditionValue type  : " +  typeof(conditionValue))
        console.log("varValue  type : " +  typeof(varValue) )
        

        console.log("Variable : " + variable)
        console.log("operator : " + operator)
        console.log("conditionValue : " + conditionValue)
        console.log("varvalue : " + varValue)
        
    

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
    })


    
   
    
  
    
    return results;

}
    
    
   
        

    




function convertOperators(operators) {
    const operatorMap = {
        'and': '&&',
        'or': '||'
    };

    return operators.map(op => operatorMap[op.toLowerCase()] || op);
}

function evaluateLogic(results, operators) {
    console.log("IN (evaluate logic) Function");

    operators.forEach((operator, index) => {
        console.log(`operator ${index}: ${operator}`);
    });

    results.forEach((result, index) => {
        console.log(`Result ${index } : ${result}`);
    });

    if (results.length - 1 !== operators.length) {
        throw new Error("The number of operators should be one less than the number of results.");
    }

    if(operators.length == 0 )
    {
        console.log("this is operators is 0 ")
        return results[0] 
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
    console.log("Execute**************************************")
    console.log("Conditions:", parsed.conditions);
    console.log("Actions:", parsed.actions + "count " + parsed.actions.length );
    console.log("Special Operators:", parsed.Speical_operators);
    console.log("type of Special Operators:", typeof(parsed.Speical_operators)); 
    
    if (parsed.conditions.length > 0  && parsed.actions.length > 0  ) {

        
        const evaluation_condtion_result  = evaluateCondition(parsed, context);
        const convertedOperators_Condition = convertOperators(parsed.Speical_operators.condition_operators);
        console.log("convertedOperators_Condition : " + convertedOperators_Condition)
        const result = evaluateLogic(evaluation_condtion_result,convertedOperators_Condition)

        console.log("back result is " + typeof(result) + " result is : " + result);

        if (result) 
        {
    
            console.log(`Condition met, executing action: `, parsed.actions);
            
            
            if (parsed.actions.length  == 0) {
                console.log('Parsed action is zero or null. Check the parsing logic.');
                return;
            }
            else{
                    //check this becuse i dont think is ok 
                parsed.actions.forEach((actionDescription, index) => {
                console.log(`Action ${index}: ${actionDescription}`);
            
                // Create a command for each action description
                const command = CommandFactory.createCommand(actionDescription);
                command.execute();
            });
            }
            

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