const { updateAndProcessRules  } = require('../../../services/rules.service');
const { tokenize } = require('../../src/lexer/lexer');
const { parse } = require('../../src/parser/parser');
const { execute } = require('../../src/executor/executor');
const Rule = require("../../../models/Rule");

class Interpeter {
    constructor(namespace) {
        if (new.target === Interpeter) {
            throw new Error("Cannot instantiate an abstract class.");
        }
        this.namespace = namespace;
        console.log(`Interpeter created with namespace: ${namespace}`);
    }

    

      async getAllRulesDescription() {
        try {
            console.log("Starting to fetch all rules description.");
            const rules = await Rule.find({});
            console.log(`Total rules fetched: ${rules.length}`);

            let activeDescriptions = [];
            activeDescriptions = rules.filter(rule => rule.isActive).map(rule => rule.description);
            console.log(`All active descriptions: ${activeDescriptions.length}`);
            if (activeDescriptions.length > 0) {
                return {
                    statusCode: 200,
                    data: activeDescriptions,
                };
            } else {
                return {
                    statusCode: 404,
                    message: "No active rules found",
                };
            }
        } catch (error) {
            console.error('Error fetching rules:', error);
            return {
                statusCode: 500,
                message: `Error fetching rules - ${error}`,
            };
        }
    }

    async interpretRuleByName(ruleDescription){
        try {
          //console.log("interpretrulebyname%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^% ");
          // Find the rule by its description using await for the asynchronous operation
          const rule = await Rule.findOne({ description: ruleDescription });
          
          if (rule) {
            //const input = stringifyCondition(rule.condition) + ' THEN ' + rule.action;
            //console.log(`Interpreting rule: ${input}`); 
          
            this.interpret(ruleDescription);
            return `Rule "${ruleDescription}" interpreted successfully.)}`; // Return a success message
          } else {
            console.log(`Rule "${ruleDescription}" not found.`);
            return `Rule "${ruleDescription}" not found.`; // Return an error message
          }
        } catch (error) {
          console.error(`Error fetching rule - ${error}`);
          return `Error fetching rule - ${error}`; // Return an error message
        }
    }

    interpret(input){
        const tokens = tokenize(input);
        const parsed = parse(input); // Ensure this returns the correct structure
        //console.log("Sameer parsed",parsed);
        execute(parsed); // `parsed` should include condition and action
    }    

    async  updateAndProcessRules(){
        
        try {
        const descriptionResult = await this.getAllRulesDescription();
        console.log("descriptionResult:", descriptionResult);
    
        if (descriptionResult.statusCode === 200) {
            const descriptions = descriptionResult.data;
            console.log("Descriptions of rules:", descriptions);
    
            for (const description of descriptions) {
            try {
                const interpretResult = await this.interpretRuleByName(description);
                console.log("Interpret result for rule:", description, interpretResult);
    
                if (interpretResult.includes("successfully")) {
                return "Rule interpreted successfully";
                }
            } catch (error) {
                console.error(`Failed to interpret rule "${description}":`, error.message);
            }
            }
        } else {
            console.error('Failed to get rule descriptions:', descriptionResult.message);
        }
        } catch (error) {
        console.error('Error processing rule descriptions:', error);
        }
        return "No active rules";
    }

    
  
   

    belongsToNamespace(room) {
        console.log(`belongsToNamespace called with room: ${JSON.stringify(room)}`);
        const belongs = room.name_space === this.namespace;
        console.log(`Room belongs to namespace ${this.namespace}: ${belongs}`);
        return belongs;
    }
}



if (require.main === module) {
    main().catch(e => console.error(e));
}

module.exports = Interpeter;
