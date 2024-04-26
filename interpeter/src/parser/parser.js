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
// function parse(input) {
//     // Initial checks and setups
//     const tokens = input.split(/\s+/);
//     let operators = {
//         condition_operators: [],
//         action_operators: []  // Ensure both operators are initialized to avoid undefined issues
//     };

//     // Example parsing logic
//     const thenIndex = tokens.findIndex(token => token.toUpperCase() === 'THEN');
//     if (thenIndex === -1) {
//         throw new Error("Syntax error: 'THEN' keyword not found.");
//     }

//     // Logical operator handling
//     const SpecialOperatorPattern = /\b(or|and|Or|And)\b/gi;
//     tokens.forEach((token, index) => {
//         if (SpecialOperatorPattern.test(token)) {
//             const operator = token.toLowerCase() === 'and' ? '&&' : '||';
//             if (index < thenIndex) {
//                 operators.condition_operators.push(operator);
//             } else {
//                 operators.action_operators.push(operator);
//             }
//         }
//     });

//     // Conditions and actions extraction logic
//     const conditions = splitPhrases(tokens.slice(0, thenIndex).join(' '));
//     const actions = splitPhrases(tokens.slice(thenIndex + 1).join(' '));

//     // Return parsed object with guaranteed structure
//     return {
//         conditions: conditions,
//         actions: actions,
//         specialOperators: operators  // Always define this, even if empty
//     };
// }


function parse(input) {
    const tokens = input.split(/\s+/);
    const thenIndex = tokens.indexOf('then');

    if (thenIndex === -1) {
        throw new Error("Syntax error: 'THEN' keyword not found.");
    }

    // Split conditions and actions
    const conditionsPart = tokens.slice(1, thenIndex).join(' ');
    const actionsPart = tokens.slice(thenIndex + 1).join(' ');

    // Split conditions by 'and' for simplicity, assuming 'and' is the only logical operator between conditions
    const conditions = conditionsPart.split(/ and /i);
    const actions = [actionsPart];  // Actions are kept together for now

    return {
        conditions: conditions,
        actions: actions,
        specialOperators: {
            condition_operators: ['&&'],  // Assume '&&' between all conditions for simplicity
            action_operators: []  // Actions are not split in this example
        }
    };
}


function splitPhrases(phrase) {
    // Placeholder for actual implementation that splits a phrase into manageable units
    return phrase.split(',');
}




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

module.exports = { parse };