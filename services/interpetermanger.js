const Interpreter = require('./interpreter');
const { getAllRoomNames, getRoomByName } = require('../../../services/rooms.service');
const {getAllRulesDescription} = require('../../../services/rules.service')

async function updateAndProcessRules() {
    try {
        const descriptionResult = await getAllRulesDescription();
        console.log(descriptionResult);

        if (descriptionResult.statusCode === 200) {
            const descriptions = descriptionResult.data;

            for (const description of descriptions) {
                console.log("Processing rule:", description);
                let { roomName, roomDetails } = await getIDwitRoomNameFromDatabase(description);
                if (roomDetails) {
                    if (roomDetails.name_space === "SmartHome") {
                        const interpretResult = await callUpdateAndProcessRules('SmartHome');
                        console.log("Interpret Result for Rule (SmartHome)", interpretResult);
                    } else if (roomDetails.name_space === "SmartSchool") {
                        const interpretResult = await callUpdateAndProcessRules('SmartSchool');
                        console.log("Interpret Result for Rule (SmartSchool)", interpretResult);
                    } else {
                        console.error(`Unknown namespace for room: ${roomDetails.name_space}`);
                    }
                } else {
                    console.error("No matching room name found in the parsed text.");
                }
            }
        } else {
            console.error('Failed to get rule descriptions:', descriptionResult.message);
        }
    } catch (error) {
        console.error('Error processing rule descriptions:', error);
    }
}

async function getIDwitRoomNameFromDatabase(parsed) {
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

function InterpreterManager() {
    const interpreterSmartHome = new Interpreter('SmartHome');
    const interpreterSmartSchool = new Interpreter('SmartSchool');

    const interpreters = {
        SmartHome: interpreterSmartHome,
        SmartSchool: interpreterSmartSchool
    };

    async function callUpdateAndProcessRules(namespace) {
        try {
            if (interpreters[namespace]) {
                const rules = await interpreters[namespace].processRules();
                return rules;
            } else {
                throw new Error('Unknown namespace');
            }
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async function getIDwitRoomNameFromDatabase(parsed) {
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

    function belongsToNamespace(room, namespace) {
        if (interpreters[namespace]) {
            return interpreters[namespace].belongsToNamespace(room);
        } else {
            throw new Error('Unknown namespace');
        }
    }

    return {
        callUpdateAndProcessRules,
        getIDwitRoomNameFromDatabase,
        belongsToNamespace,
        updateAndProcessRules
    };
}

module.exports = InterpreterManager;
