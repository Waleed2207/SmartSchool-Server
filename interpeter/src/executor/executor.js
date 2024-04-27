const { forEach, cond } = require('lodash');
const {CommandFactory} = require('../factories/commandFactory');
const { debug, Console } = require('console');

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
    console.log("result 0 " + results[0] )
    let currentValue = results[0] ;  
    console.log("Iniitlize currentValue " + currentValue)
    for (let i = 0; i < operators.length; i++) {
        const nextValue = results[i + 1];
        switch (operators[i]) {  // Removed toLowerCase() as we're using symbols, not words
            case '&&':  // Using symbol for AND
                console.log("&&");
                console.log("currentValue : " + currentValue + "nextValue : " + nextValue)
                currentValue = currentValue && nextValue;
                console.log("currentValue" + currentValue)
                break;
            case '||':  // Using symbol for OR
                console.log("&&");
                console.log("currentValue : " + currentValue + "nextValue : " + nextValue)
                currentValue = currentValue || nextValue;
                console.log("currentValue" + currentValue)
                break;
            default:
                console.error(`Unsupported operator: ${operators[i]}`);
                return false;
        }
    }
    return currentValue;
}



function evaluateCondition(parsed, context) {
    console.log("evaluateCondition!!!!!!!!!!!!!!!!!!!");
    const structuredVariablePattern = /\b(Joe|detection|temperature|activity|season)\b/gi;
    const unaryConditionPattern = /^\s*(studying|eating|sleeping)\s*$/i;  // Pattern to catch unary conditions
    const operatorPattern = /\b(is above|is below|is equal to|is above or equal to|is below or equal to|is|in)\b/gi;
    const valuePattern = /\b(\d{1,3}|ON|OFF|True|False|true|false|spring|summer|fall|winter|studying|cooking|eating|playing|watching_tv|sleeping|room 247)\b/gi;
    let variable, operator, conditionValue,contextValue;
    let results = [];

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

        console.log("variable : "  +  variableMatch );
        console.log("operator : "  +  operator );
        console.log("conditionValue : "  +  conditionValue );

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


     
        console.log("contxtvalue is :   " + contextValue + "   conditionValue  is :   " + conditionValue);

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
    console.log("results :  "  +  results )
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








function execute(parsed, context) {
    console.log("Conditions :", parsed.conditions);
    console.log("Actions:", parsed.actions);
    console.log("SpecialOperators condtion operators:", parsed.specialOperators.condition_operators);

    const evaluation_condition_result = evaluateCondition(parsed, context);
    console.log("2");

    const convertedOperators_Condition = convertOperators(parsed.specialOperators.condition_operators);
    console.log("3");

    const result = evaluateLogic(evaluation_condition_result, convertedOperators_Condition);
    console.log("4");
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