const {updateAndProcessRules,interpretRuleByName} = require('./rules.service');

class Interpreter { 
    constructor(namespace) {
        this.namespace = namespace;
        this.rules = [];
    }   

    async call_processRules() {
        try {
            this.rules = await updateAndProcessRules();
            return this.rules;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async interpretRuleByName(ruleName) {
        try {
            const rule = await interpretRuleByName(ruleName);
            return rule;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    belongsToNamespace(room) {
        return room.name_space === this.namespace;
    }
}

module.exports = Interpreter;
