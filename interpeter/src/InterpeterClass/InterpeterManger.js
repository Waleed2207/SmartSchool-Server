const { GetRoomNameFromDatabase } = require('../executor/executor');
const { getAllRoomIds,getRoomByName,getAllRoomNames } = require('../../../services/rooms.service');  
const Rule = require("../../../models/Rule");
 const SmartHomeInterpreter = require('./SmartHomeInterpeter');
 const SmartSchoolInterpreter = require('./SmartSchoolInterpeter');

class InterpeterManger {
    constructor() {
        console.log('InterpeterManger created');
    }

    // createInterpreter(namespace) {
    //     this.namespace = namespace;
    //     if (namespace === 'SmartHome') {
    //         return new SmartHomeInterpreter(namespace);
    //     } else if (namespace === 'SmartSchool') {
    //         return new SmartSchoolInterpreter(namespace);
    //     } else {
    //         console.log('Unknown namespace');
    //         return null;
    //     }
    // }

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

    async  GetRoomNameFromDatabase(parsed) {
        try {
            // console.log("GetIDwitRoomNameFromDatabase"); 
            // console.log("Parsed object:", parsed);   
           
            // Fetch all room names from the database
            const roomNames = await getAllRoomNames();
            //console.log("Room names from DB:", roomNames);
     
            // Define the pattern to match room names
            const roomNamesPatternString = roomNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
            const roomNamesPattern = new RegExp(`\\b(${roomNamesPatternString})\\b`, 'i');
     
            // Search for a room name in the parsed string
            const roomNameMatch = parsed.match(roomNamesPattern);
            //console.log("Room Name Match:", roomNameMatch); 
    
            if (roomNameMatch && roomNameMatch[0]) {
                const roomName = roomNameMatch[0].trim();
                const roomDetails = await getRoomByName(roomName);
                return { roomName, roomDetails };
    
                //console.log("Fetching details for Room Name:", roomName);
    
                // Fetch the room details from the database by room name
               
                //console.log("Room Details from DB:", roomDetails);
    
                // // Check if roomDetails is not null and has the property 'id'
                // if (roomDetails && (roomDetails.id || roomDetails._id)) {
                //     const roomId = roomDetails.id || roomDetails._id;
                //     console.log("Room ID:", roomId);
                //     return roomId;
                // } else {
                //     console.log("Room details are null or missing an 'id'.");
                //     return null;
                // }
            } else {
                console.log("No matching room name found in the parsed text.");
                return { roomName: null, roomDetails: null };
            }
        } catch (err) {
            console.log("Error in getting room ID from room details:", err);
            return { roomName: null, roomDetails: null };
        }
    }
  

    async main() {
        console.log('Main');
        const descriptionResult = await this.getAllRulesDescription();
        if (descriptionResult.statusCode === 200) {
            const descriptions = descriptionResult.data;
            console.log("Descriptions of rules:", descriptions);
            for (const description of descriptions) {
                console.log(`Rule description: ${description}`);
                let { roomName, roomDetails } = await this.GetRoomNameFromDatabase(description);
                // console.log("Room Details:", roomDetails);
                if (roomDetails.name_space === 'SmartHome') {
                    //console.log('SmartHome');
                    const smartHomeInterpreter = new SmartHomeInterpreter(roomDetails.name_space);
                    smartHomeInterpreter.updateAndProcessRules();
                } else if (roomDetails.name_space === 'SmartSchool') {
                    const smartSchoolInterpreter = new SmartSchoolInterpreter(roomDetails.name_space);
                    smartSchoolInterpreter.updateAndProcessRules();
                    //console.log('SmartSchool');
                }
            }
            
        } 
        else{
            console.error('Failed to get rule descriptions:', descriptionResult.message);
        }
       

      
    }
}

module.exports = InterpeterManger;





 // async callgetAllRulesDescription() {
    //     console.log('Call To getAllRulesDescription called');
    //     try {
    //         console.log('getAllRulesDescription called');
    //         const result = await this.getAllRulesDescription();
    //         if (result.statusCode === 200) {
    //             console.log('Rules:', result.data);
    //             return result.data;
    //         } else {
    //             console.log(result.message);
    //             return [];
    //         }
    //     } catch (e) {
    //         console.error('Error in getAllRulesDescription:', e.message);
    //         return [];
    //     }
    // }

    // async CalltwoCallgetAllRulesDescription() {
    //     console.log('getAllRulesDescription called');
    //     try {
    //         const result = await this.callgetAllRulesDescription(); // Call the method correctly with 'this.'
    //         if (result.statusCode === 200) {
    //             console.log('Rules:', result.data);
    //             return result.data;
    //         } else {
    //             console.log(result.message);
    //             return [];
    //         }
    //     } catch (e) {
    //         console.error('Error in getAllRulesDescription:', e.message);
    //         return [];
    //     }
    // }



      // async callGetRoomNameFromDatabase(rule) {
    //     console.log('GetRoomNameFromDatabase called');
    //     try {
    //         const room = await GetRoomNameFromDatabase(rule);
    //         if (room && room.roomDetails) {
    //             console.log('Room:', room.roomDetails);
    //             return room.roomDetails;
    //         } else {
    //             console.log('No matching room found.');
    //             return null;
    //         }
    //     } catch (e) {
    //         console.error('Error in GetRoomNameFromDatabase:', e.message);
    //         return null;
    //     }
    // }