// src/lexer/index.js


function tokenize(input) {
    const operators = ['is above', 'is above or equal to', 'is below or equal to', 'is below', 'is equal to', 'is less', 'is greater than', 'And', 'Or'];
    let tokens = [];
    let modifiedInput = input;

    operators.forEach(op => {
        // Replace the operator with a unique separator for easier tokenization
        const escapedOp = op.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"); // Escape any special regex characters
        const regex = new RegExp(`\\b${escapedOp}\\b`, 'g');
        modifiedInput = modifiedInput.replace(regex, ` %%${op}%% `);
    });

    // Split the input at the unique separator and flatten the array
    tokens = modifiedInput.split('%%').flatMap(part => part.match(/\S+/g) || []);

    return tokens;
}

module.exports = { tokenize };