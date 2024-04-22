// /  Parses tokens into an actionable structure
function parse(tokens) {
    
    // Find the index of the 'THEN' token
    let variables = [], operators = [], values = [];
    let match;

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
    const conditionString = conditionTokens.join(' ');
    // Validate that action part is not empty
    if (actionTokens.length === 0) {
        throw new Error("Syntax error: No action specified.");
    }
    
    const variablePattern = /\bdetection|temperature\b/gi;
    const operatorPattern = /\bis above|is below|is equal to|is above or equal to|is below or equal to|or|and\b/gi;
    const valuePattern = /\b(\d{1,3}|ON|OFF|True|False|true|false)\b/gi;
     
    // Arrays to store the matched items
  

    conditionTokensString = conditionTokens.join(' ');
    while ((match = variablePattern.exec(conditionTokensString)) !== null) {

        variables.push(match[0]);
        
    }

    // Extract operators using regex
    while ((match = operatorPattern.exec(conditionTokensString)) !== null) {
   
        operators.push(match[0]);
    }

    // Extract values using regex
    while ((match = valuePattern.exec(conditionTokensString)) !== null) {
        values.push(match[0]);
    }
    /*
      // Log all values after filling each array
      console.log(`Variables collected: ${variables.join(', ')}`);
      console.log(`Operators collected: ${operators.join(', ')}`);
      console.log(`Values collected: ${values.join(', ')}`);
    */

    // Validate that we have all parts of the condition
    if ( variables.length === 0    || operators.length === 0  || values.length === 0) {
        throw new Error("Syntax error: Incomplete condition expression.");
    }
   
   

    // Build the condition and action objects
    const condition = { variables, operators, values };
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