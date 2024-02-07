// src/lexer/index.js


// Tokenizes input strings
function tokenize(input) {
    // Example of a more advanced tokenizer that handles multi-word operators
    const operators = ['is above or equal to', 'is below or equal to', 'is above', 'is below', 'is equal to' , 'is less' , 'is gretter than','And' ,'Or'];
    let tokens = [];

    operators.forEach(op => {
        if (input.includes(op)) {
            tokens = input.split(op);//split to substring
            console.log(tokens)
            tokens.splice(1, 0, op); // Insert the operator back between the split parts
            console.log(tokens)
            input = tokens.join('%%'); // Use a unique separator for further tokenization
            console.log(input)
        }
    });
    console.log(input.split('%%').flatMap(part => part.match(/\S+/g)))
    return input.split('%%').flatMap(part => part.match(/\S+/g) || []);
}


module.exports = { tokenize };