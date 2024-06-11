// // /  Parses tokens into an actionable structure
// function parse(tokens) {
//     // Find the index of the 'THEN' token
//     const thenIndex = tokens.findIndex(token => token === 'THEN');
//     if (thenIndex === -1) {
//         throw new Error("Syntax error: 'THEN' keyword not found.");
//     }

//     // Check for sufficient tokens to form a condition
//     if (thenIndex < 3) { // At least 3 tokens needed: IF, variable, operator, value
//         throw new Error("Syntax error: Incomplete condition.");
//     }

//     // Get the tokens that form the condition and action parts
//     const conditionTokens = tokens.slice(1, thenIndex); // Skip the initial "IF"
//     const actionTokens = tokens.slice(thenIndex + 1);

//     // Validate that action part is not empty
//     if (actionTokens.length === 0) {
//         throw new Error("Syntax error: No action specified.");
//     }

//     // Extract the variable, operator, and value from condition tokens
//     const variable = conditionTokens[0];
//     const operatorTokens = conditionTokens.slice(1, -1); // Exclude the variable and value
//     const value = conditionTokens[conditionTokens.length - 1]; // The last token is the value
//     const operator = operatorTokens.join(' ');

//     // Validate that we have all parts of the condition
//     if (!variable || !operator || value === undefined) {
//         throw new Error("Syntax error: Incomplete condition expression.");
//     }

//     // Build the condition and action objects
//     const condition = { variable, operator, value };
//     const action = actionTokens.join(' ');

//     return { condition, action };
// }

// module.exports = { parse };

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
/*
*/

function parse(input) {

    const tokens = typeof input === 'string' ? input.split(/\s+/) : input;
    const thenIndex = tokens.findIndex(token => token.toUpperCase() === 'THEN')
    let match;
    let operators = {
        condition_operators: [],
        action__operators: []
    };

   ;
     
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
    
    // console.log("the condition operator " + operators.condition_operators)
    // console.log("the action operator " + operators.action__operators)


    if (thenIndex === -1) {
        throw new Error("Syntax error: 'THEN' keyword not found.");
    }

    // Split conditions and actions
    const conditionsPart = tokens.slice(1, thenIndex).join(' ');
    const actionsPart = tokens.slice(thenIndex + 1).join(' ');

    // Split conditions by 'and' for simplicity, assuming 'and' is the only logical operator between conditions
    const conditions = conditionsPart.split(/ and /i);
    const actions = actionsPart.split(/ and /i);;  // Actions are kept together for now

    return {
        conditions: conditions,
        actions: actions,
        specialOperators: {
            condition_operators: operators.condition_operators,  // Assume '&&' between all conditions for simplicity
            action_operators: operators.action__operators  // Actions are not split in this example
        }
    };
}




module.exports = { parse };


