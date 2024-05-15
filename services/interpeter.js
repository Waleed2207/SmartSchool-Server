const { updateAndProcessRules, interpretRuleByName } = require('./rules.service');

function interpreter(namespace) {
    async function call_processRules() {
        try {
            const rules = await updateAndProcessRules();
            return rules;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async function interpretRuleByName(ruleName) {
        try {
            const rule = await interpretRuleByName(ruleName);
            return rule;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    function belongsToNamespace(room) {
        return room.name_space === namespace;
    }

    return {
        call_processRules,
        interpretRuleByName,
        belongsToNamespace
    };
}

module.exports = {
    interpreter
};
