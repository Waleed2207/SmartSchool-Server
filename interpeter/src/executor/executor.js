const { forEach, cond } = require('lodash');
const {CommandFactory} = require('../factories/commandFactory');
const { debug, Console } = require('console');
const {SpecialDictionary} = require('./Dictionsry');
const myDict = require('./Dictionsry');






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

    if(operators.length == 0 )
    {
        return results[0];

    }

    let currentValue = results[0] ;  
   
    for (let i = 0; i < operators.length; i++) {
        const nextValue = results[i + 1];
        switch (operators[i]) {  // Removed toLowerCase() as we're using symbols, not words
            case '&&':  // Using symbol for AND  
                currentValue = currentValue && nextValue;
                console.log("currentValue" + currentValue )
                break;
            case '||':  // Using symbol for OR
                currentValue = currentValue || nextValue;
                break;
            default:
                console.error(`Unsupported operator: ${operators[i]}`);
                return false;
        }
    }
    console.log("currentValue" + currentValue )
    return currentValue;
}



function evaluateCondition(parsed, context) {
    console.log("evaluateCondition!!!!!!!!!!!!!!!!!!!");
    const structuredVariablePattern = /\b(Joe|detection|temperature|activity|season)\b/gi;
   // const naturalLanguagePattern = /(?:he|the)\s+(activity|season)\s+is\s+(\w+|in)/i;  // Removed "he" from capture group
    const unaryConditionPattern = /^\s*(studying|eating|sleeping)\s*$/i;  // Pattern to catch unary conditions
    const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in)\b/gi;
   
    const valuePattern = /\b(room\s+\d+\s+is\s+)?(1|0|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping)\b/gi;
    let variable, operator, conditionValue,contextValue;
    let results = [];
    //room 247

    console.log("Current context:", context);

    parsed.conditions.forEach((condition) => {
        /*
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
        */
        
        if (myDict.check(condition) == true) {
            console.log("we found joe in room 247 in dictinory")
            condition = myDict.getValue(condition); 
           
            
        }

        
        let variableMatch = condition.match(structuredVariablePattern) || [last_varibale] ;
      
       
    
      

        
       
        let operatorMatch = condition.match(operatorPattern) || [last_operator] ;
        let valueMatch = condition.match(valuePattern) || [last_conditionValue] ;
        if (!variableMatch || !operatorMatch || !valueMatch) {
            console.error('Error parsing structured condition:', condition);
            results.push(false);
            return;
        }

        variable = variableMatch[0].toLowerCase();
        operator = operatorMatch[0].toLowerCase().trim();
        conditionValue = valueMatch[0].toLowerCase();

        
        last_varibale = variable;
        last_operator = operator;
        last_conditionValue = conditionValue;

      

        if(conditionValue == 'on' |  conditionValue == 'On' ) 
        {
            conditionValue = true;

        }
        if(conditionValue == 'off' |  conditionValue == 'off')
        {

            conditionValue = false;

        }

        if (conditionValue == 'studying' || conditionValue == 'cooking' || conditionValue == 'eating' ||
            conditionValue == 'playing' || conditionValue == 'watching_tv') {
            
            contextValue = context.hasOwnProperty('activity') ? context['activity'].toString().toLowerCase() : null;
        } else if (conditionValue == 'spring' || conditionValue == 'summer' || conditionValue == 'fall' ||
                conditionValue == 'winter') {
            
            contextValue = context.hasOwnProperty('season') ? context['season'].toString().toLowerCase() : null;
        }
        else{
            contextValue = context.hasOwnProperty(variable) ? context[variable].toString().toLowerCase() : null;
        }  
        console.log("condtion is : " + condition) 
        console.log("variable :  " + variable);
        console.log("operator :  " + operator);
        console.log("conditionValue :  " + conditionValue);
        console.log("contextValue : " + contextValue + " conditionValue : " + conditionValue);
     
       

        switch (operator) {
           
            case 'is above':
                results.push( contextValue > conditionValue);
                break;
            case 'is below':
                results.push(contextValue < parseFloatconditionValue);
                break;
            case 'is equal to':
                results.push(contextValue === conditionValue);
                break;
            case 'is':  // Treat 'is' as an alias for 'is equal to'
                 results.push(contextValue === conditionValue);
                break;
            case 'is above or equal to':
                results.push(contextValue  >=  conditionValue );
                break;
            case 'is below or equal to':
                results.push(contextValue <= conditionValue);
                break;
            case 'in':  // Checks if the context value contains the given substring or matches one of a list
                results.push(contextValue === conditionValue);
                //results.push(contextValue.includes(conditionValue));
                break;
            default:
                console.error(`Unknown operator: ${operator}`);
                results.push(false);
                break;
        }
       
    });
    console.log("results : " + results)
   
    return results;
}












function execute(parsed, context) {
    console.log("Conditions :", parsed.conditions);
    console.log("Actions:", parsed.actions);
    console.log("SpecialOperators condtion operators:", parsed.specialOperators.condition_operators);

    const evaluation_condition_result = evaluateCondition(parsed, context);
   

    const convertedOperators_Condition = convertOperators(parsed.specialOperators.condition_operators);
   

    const result = evaluateLogic(evaluation_condition_result, convertedOperators_Condition);
 
    console.log("Result of conditions:", result);

    if (result) {
        parsed.actions.forEach(action => {
            console.log("Current action being processed:", action);
            const commandTypeMatch = action.match(commandTypePattern);
            const command = CommandFactory.createCommand(parsed.action);
            if (command) {
                command.execute();
            } else {
                console.log('Action could not be executed:', parsed.action);
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



module.exports = { execute };