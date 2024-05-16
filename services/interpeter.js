const { updateAndProcessRules, interpretRuleByName } = require('./rules.service');

class AbstractInterpreter {
    constructor(namespace) {
        if (new.target === AbstractInterpreter) {
            throw new Error("Cannot instantiate an abstract class.");
        }
        this.namespace = namespace;
        console.log(`AbstractInterpreter created with namespace: ${namespace}`);
    }

    async callProcessRules() {
        console.log('callProcessRules called');
        try {
            const result = await updateAndProcessRules();
            console.log('Rules processed:', rules);
            return result;
        } catch (e) {
            console.error('Error in callProcessRules:', e.message);
            throw new Error(e.message);
        }
    }

    // async interpretRuleByName(ruleName) {
    //     console.log(`interpretRuleByName called with ruleName: ${ruleName}`);
    //     try {
    //         const rule = await interpretRuleByName(ruleName);
    //         console.log('Rule interpreted:', rule);
    //         return rule;
    //     } catch (e) {
    //         console.error('Error in interpretRuleByName:', e.message);
    //         throw new Error(e.message);
    //     }
    // }

    belongsToNamespace(room) {
        console.log(`belongsToNamespace called with room: ${JSON.stringify(room)}`);
        const belongs = room.name_space === this.namespace;
        console.log(`Room belongs to namespace ${this.namespace}: ${belongs}`);
        return belongs;
    }
}

class SmartSchoolInterpreter extends AbstractInterpreter {
    constructor(namespace) {
        super(namespace);
        console.log(`SmartSchoolInterpreter created with namespace: ${namespace}`);
    }
}

class SmartHomeInterpreter extends AbstractInterpreter {
    constructor(namespace) {
        super(namespace);
        console.log(`SmartHomeInterpreter created with namespace: ${namespace}`);
    }
}

module.exports = {
    SmartSchoolInterpreter,
    SmartHomeInterpreter
};
