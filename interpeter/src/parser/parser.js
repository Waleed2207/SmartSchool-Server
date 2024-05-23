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

function splitPhrases(phrase) {
    // Placeholder for actual implementation that splits a phrase into manageable units
    return phrase.split(',');
}
*/

function parse(input) {

   
   
    const tokens = typeof input === 'string' ? input.split(/\s+/) : input;
    const thenIndex = tokens.findIndex(token => token.toUpperCase() === 'THEN')
    let match;
   

    let operators = {
        condition_operators: [],
        action__operators: []
    };

   
     
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




