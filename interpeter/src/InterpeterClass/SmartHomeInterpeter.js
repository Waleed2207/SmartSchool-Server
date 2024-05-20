const interpeter = require('./interpeter');

class SmartHomeInterpeter extends interpeter {
    constructor(namespace) {
        super(namespace);
        console.log(`SmartSchoolInterpreter created with namespace: ${namespace}`);
    }
}

module.exports = SmartHomeInterpeter;
