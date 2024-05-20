const interpeter = require('./interpeter');

class SmartSchoolInterpreter extends interpeter {
    constructor(namespace) {
        super(namespace);
        console.log(`SmartSchoolInterpreter created with namespace: ${namespace}`);
    }
}

module.exports = SmartSchoolInterpreter;
