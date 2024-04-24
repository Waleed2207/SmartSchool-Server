function splitPhrases(phraseStr,special_Operators) {
    // Split the string based on ' and ' or ' or ', maintaining case insensitivity
    const parts = phraseStr.split(/\s+(and|or)\s+/i);
    const matches = [];
    let currentPhrase = "";

    parts.forEach(part => {
        if (part.toLowerCase() === 'and' || part.toLowerCase() === 'or') {
            
            // Reset the current phrase only if a complete phrase was constructed
            if (currentPhrase !== "") {
                matches.push(currentPhrase.trim());
                currentPhrase = "";
            }
        } else {
            // Add part to the current phrase; continue accumulating parts until 'and' or 'or'
            currentPhrase += (currentPhrase.length > 0 ? " " : "") + part;
        }
    });

    // If there's any leftover phrase after the last 'and' or 'or', add it to matches
    if (currentPhrase !== "") {
        matches.push(currentPhrase.trim());
    }

    return matches;
}


// /  Parses tokens into an actionable structure
function parse(input) {
    
    //console.log("parser input :  " + input);
    // Check if input is a string and split into tokens if necessary
    console.log("Parse!!!!!!!!!!!!!!!")
    const tokens = typeof input === 'string' ? input.split(/\s+/) : input;
    let match;
    console.log("tokens : " + tokens);

    let operators = {
        condition_operators: [],
        action__operators: []
    };

    const thenIndex = tokens.findIndex(token => token.toUpperCase() === 'THEN');
     
    const SpecialOperatorPattern = /\b(or|and|Or|And)\b/gi;

    tokens.forEach((token, index) => {
        if (SpecialOperatorPattern.test(token)) {
            if (index < thenIndex) {
                // It's a condition operator
                operators.condition_operators.push(token === 'and' ? '&&' : '||');
            } else {
                // It's an action operator
                operators.action__operators.push(token === 'and' ? '&&' : '||');
            }
        }
    });
    
    console.log("the condition operator " + operators.condition_operators)
    console.log("the action operator " + operators.action__operators)


   

    
    
    
 

    if (thenIndex === -1) {
        throw new Error("Syntax error: 'THEN' keyword not found.");
    }

    if (thenIndex < 3) { // Minimum tokens to form a condition
        throw new Error("Syntax error: Incomplete condition.");
    }

    const conditionTokens = tokens.slice(1, thenIndex);
    const actionTokens = tokens.slice(thenIndex + 1);

    if (actionTokens.length === 0) {
        throw new Error("Syntax error: No action specified.");
    }

    // Concatenate the tokens into a single string for easier manipulation
    const conditionString = conditionTokens.join(' ');
    const ActionString = actionTokens.join(' ');


    const conditionsArray = splitPhrases(conditionString);
    const ActionArray = splitPhrases(ActionString)

    
    /*
    // Log all values after filling each array
    console.log(`Conditions extracted: ${JSON.stringify(conditionsArray)}`);
    console.log(`Action extracted: ${JSON.stringify(ActionArray)}`);
    console.log(`Speical_operators extracted: ${JSON.stringify(and_or_special_Operators)}`);
    */
   
    if (conditionsArray.length === 0 | ActionArray.length == 0  ) {
        throw new Error("Syntax error: Incomplete condition expression.");
    }
   
    const action = actionTokens.join(' ');
    return { conditions: conditionsArray, actions : ActionArray , Speical_operators: operators};
}

module.exports = { parse };


/*

    
   
   

*/

/*

function parse(tokens) {
    const thenIndex = tokens.findIndex(token => token.toLowerCase() === 'then');
    const ifIndex = tokens.findIndex(token => token.toLowerCase() === 'if');
    
    // Assume the condition part is everything between "IF" and "THEN"
    const conditionTokens = tokens.slice(ifIndex + 1, thenIndex);
    const actionTokens = tokens.slice(thenIndex + 1);
    
    // Split the condition tokens by "AND"
    const conditions = [];
    let conditionStartIndex = 0;
    conditionTokens.forEach((token, index) => {
        if (token.toLowerCase() === 'and') {
            const singleConditionTokens = conditionTokens.slice(conditionStartIndex, index);
            conditions.push(buildConditionObject(singleConditionTokens));
            conditionStartIndex = index + 1;
        }
    });
*/

