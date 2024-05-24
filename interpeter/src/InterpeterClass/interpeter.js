const { updateAndProcessRules  } = require('../../../services/rules.service');
const { tokenize } = require('../../src/lexer/lexer');
const { parse } = require('../../src/parser/parser');
const { execute } = require('../../src/executor/executor');
const Rule = require("../../../models/Rule");
const { log } = require('console');

class Interpeter {
    constructor(namespace) {
        if (new.target === Interpeter) {
            throw new Error("Cannot instantiate an abstract class.");
        }
        this.namespace = namespace;
        //console.log(`Interpeter created with namespace: ${namespace}`);
    }

    

    async getAllRulesDescription() {
        try {
            const rules = await Rule.find({});
            let activeDescriptions = rules.filter(rule => rule.isActive).map(rule => rule.description);
    
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

    async interpretRuleByName(ruledescription) {
        try {
            const interpretedRules = [];
            const rules = await Rule.find({ description: ruledescription });
            

            if (rules.length > 0) {
               
    
                for (const rule of rules) {
                    // Assuming interpret function processes a rule
    
                    const success = await this.interpret(rule.description);
                    console.log("success: ", success);  
                    if(success){
                        interpretedRules.push({
                            description: rule.description,
                            interpreted: true,
                            details: rule,
                            success: true
                        });

                       
                    }
                    else{
                        interpretedRules.push({
                            description: rule.description,
                            interpreted: true,
                            details: rule,
                            success: false,
                        });
                        console.log(`Failed to interpret rule "${rule.description}"`);
                    }
                    
                }
    
               
            } else {
                console.log(`No rules found with description "${ruleDescription}".`);
                return {
                    success: false,
                    message: `No rules found with description "${ruleDescription}".`,
                    rules: []
                };
            }
        } catch (error) {
            console.error(`Error fetching rules - ${error}`);
            return {
                success: false,
                message: `Error fetching rules: ${error.message}`,
                rules: []
            };
        }
        return interpretedRules;
    }
    

    async interpret(input){
        //const tokens = tokenize(input);
        const parsed = await  parse(input); // Ensure this returns the correct structure
        const  success = await execute(parsed);
        return success; // `parsed` should include condition and action
    }    

    async updateAndProcessRules(ruledescription) {
        try {
        
            try {
                        
                const interpretResult  = await this.interpretRuleByName(ruledescription); 
                console.log("we back form execute#!@#!#@!#@!#@!#@#!@#@!#@!#@!#!@#")
                console.log("success: ", interpretResult.success);
                // Check if interpretResult includes 'successfully'
                if (interpretResult.success) {
                    console.log("Rule interpreted successfully");
                   
                }
                else{
                    console.log("Rule not interpreted successfully");
                }
            } catch (error) {
                console.error(`Failed to interpret rule "${ruledescription}":`, error.message);
            }
          
           
        } catch (error) {
            console.error('Error processing rule descriptions:', error);
        }
        return "No active rules"; // Return this if no rules are processed successfully
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


 // if (descriptionResult.statusCode === 200) {
            //     const descriptions = descriptionResult.data;
    
            //     for (const description of descriptions) {
            //         console.log(`Processing rule "${description}"...`);
            //         try {
                        
    
            //             // Check if interpretResult includes 'successfully'
            //             if (interpretResult.success) {
            //                 console.log("Rule interpreted successfully");
            //             }
            //         } catch (error) {
            //             console.error(`Failed to interpret rule "${description}":`, error.message);
            //         }
            //     }
            //     // If all rules are processed without breaking the loop
            // } else {
            //     console.error('Failed to get rule descriptions:', descriptionResult.message);
            // }