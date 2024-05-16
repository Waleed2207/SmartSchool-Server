const { SmartSchoolInterpreter, SmartHomeInterpreter } = require('./interpeter.js');
const { getAllRoomNames, getRoomByName } = require('./rooms.service.js');
const { getAllRulesDescription } = require('./rules.service.js');

class InterpreterManager {
    constructor() {
        this.interpreters = {
            SmartHome: SmartHomeInterpreter,
            SmartSchool: SmartSchoolInterpreter
        };
    }

    async getAllRulesDescription() {
        try {
            console.log('interpeter manger Getting all rule descriptions');
            const descriptionResult = await getAllRulesDescription();
            console.log(descriptionResult);
            return descriptionResult;
        } catch (error) {
            console.error('Error getting rule descriptions:', error);
            throw new Error('Failed to get rule descriptions');
        }
    }

    async getRoomNameAndDetails(parsed) {
        try {
            const roomNames = await getAllRoomNames();
            const roomNamesPatternString = roomNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
            const roomNamesPattern = new RegExp(`\\b(${roomNamesPatternString})\\b`, 'i');
            const roomNameMatch = parsed.match(roomNamesPattern);

            if (roomNameMatch && roomNameMatch[0]) {
                const roomName = roomNameMatch[0].trim();
                const roomDetails = await getRoomByName(roomName);
                return { roomName, roomDetails };
            } else {
                console.log("No matching room name found in the parsed text.");
                return { roomName: null, roomDetails: null };
            }
        } catch (err) {
            console.log("Error in getting room ID from room details:", err);
            return { roomName: null, roomDetails: null };
        }
    }

    async createInterpreter(parsed) {
        try {
            const { roomName, roomDetails } = await this.getRoomNameAndDetails(parsed);
            if (roomDetails) {
                const namespace = roomDetails.name_space;
                if (this.interpreters[namespace]) {
                    const interpreter = new this.interpreters[namespace](namespace);
                    console.log(`Created interpreter for namespace: ${namespace}`);
                    return interpreter;
                } else {
                    console.error(`Unknown namespace for room: ${roomDetails.name_space}`);
                    return null;
                }
            } else {
                console.error("No matching room name found in the parsed text.");
                return null;
            }
        } catch (error) {
            console.error('Error creating interpreter:', error);
            return null;
        }
    }

    async processRules() {
        try {
            console.log('Processing rules...');
            const descriptionResult = await this.getAllRulesDescription();

            if (descriptionResult.statusCode === 200) {
                const descriptions = descriptionResult.data;

                for (const description of descriptions) {
                    console.log("Processing rule:", description);
                    const interpreter = await this.createInterpreter(description);

                    if (interpreter) {
                        const interpretResult = await interpreter.updateAndProcessRules();  // Call the method from the AbstractInterpreter class
                        console.log(`Interpret Result for Rule (${interpreter.namespace})`, interpretResult);
                    }
                }
            } else {
                console.error('Failed to get rule descriptions:', descriptionResult.message);
            }
        } catch (error) {
            console.error('Error processing rule descriptions:', error);
        }
    }
}

async function main() {
    console.log("Starting main...");
    console.log("Checking interpreter condition...");
    const manager = new InterpreterManager();
    manager.processRules();
   
  
  
    
  }
  main().catch(err => console.error(err));
  

module.exports = InterpreterManager;
