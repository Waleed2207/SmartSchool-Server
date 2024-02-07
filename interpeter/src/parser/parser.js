// /  Parses tokens into an actionable structure
function parse(tokens) {
    // Find the index of the 'THEN' token
    const thenIndex = tokens.findIndex(token => token === 'THEN');
    if (thenIndex === -1) {
        throw new Error("Syntax error: 'THEN' keyword not found.");
    }

    // Check for sufficient tokens to form a condition
    if (thenIndex < 3) { // At least 3 tokens needed: IF, variable, operator, value
        throw new Error("Syntax error: Incomplete condition.");
    }

    // Get the tokens that form the condition and action parts
    const conditionTokens = tokens.slice(1, thenIndex); // Skip the initial "IF"
    const actionTokens = tokens.slice(thenIndex + 1);

    // Validate that action part is not empty
    if (actionTokens.length === 0) {
        throw new Error("Syntax error: No action specified.");
    }

    // Extract the variable, operator, and value from condition tokens
    const variable = conditionTokens[0];
    const operatorTokens = conditionTokens.slice(1, -1); // Exclude the variable and value
    const value = conditionTokens[conditionTokens.length - 1]; // The last token is the value
    const operator = operatorTokens.join(' ');

    // Validate that we have all parts of the condition
    if (!variable || !operator || value === undefined) {
        throw new Error("Syntax error: Incomplete condition expression.");
    }

    // Build the condition and action objects
    const condition = { variable, operator, value };
    const action = actionTokens.join(' ');

    return { condition, action };
}


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