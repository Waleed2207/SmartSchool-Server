const TurnDeviceOnCommand = require('../commands/turnDeviceOnCommand');
const TurnDeviceOffCommand = require('../commands/turnDeviceOffCommand');
const { getDevices } = require('../../../services/devices.service');
const { getAllRoomIds } = require('../../../services/rooms.service');
const Device = require("../../../models/Device");

// const constructDeviceRegex = async () => {
//     try {
//         const devices = await getAllRoomIds();
//         const devices2  = await getDevices();
//         // Assuming each device has a 'name' property. Adjust if your data structure is different.
//         const deviceNames = devices2.map(device => device.name.toLowerCase());
//         const DevicesID = devices.map(device => device);
//         const pattern = deviceNames.join("|"); // Creates a string that joins all device names with '|'
//         const pattern2 = DevicesID.join("|"); // Creates a string that joins all device names with '|'
//         console.log("device pattern: " + pattern);
//         console.log("Room ID pattern: " + pattern2);
//         // Include the 'g' flag for a global search
//         return new RegExp(`\\b(${pattern})\\b`, 'ig'); // Case insensitive and global match
//     } catch (err) {
//         console.log("Error constructing device regex: ", err);
//         return null;
//     }
// };




const constructDeviceRegex = async () => {
    try {
        const roomIds = await getAllRoomIds(); // Assuming this gives an array of room IDs
        const devices = await getDevices(); // Assuming each device has a 'name' and 'roomId' property

        // Create a map where each device name is linked to its room ID
        const deviceRoomMap = devices.reduce((map, device) => {
            // Use the device name in lower case as the key for consistency
            map[device.name.toLowerCase()] = device.roomId; // Adjust if your device structure is different
            return map;
        }, {});

        // For debug and verification, print the map
      //  console.log("Device to Room ID map:", deviceRoomMap);

        // To use this mapping, you would access `deviceRoomMap[deviceName]` to get the room ID

        // If you still need to create a regex from the device names:
        const pattern = Object.keys(deviceRoomMap).join("|"); // Joins all device names into a regex pattern
        console.log("Device pattern: " + pattern);
        
        return new RegExp(`\\b(${pattern})\\b`, 'ig'); // Case insensitive and global match regex

    } catch (err) {
        console.log("Error constructing device regex mapping: ", err);
        return null;
    }
};


const searchDevicesInAction = async (action) => {
    const devicePattern = await constructDeviceRegex();
    if (devicePattern) {
        const matchesIterator = action.matchAll(devicePattern);
        const matches = [];
        for (const match of matchesIterator) {
            matches.push(match[0]); // match[0] contains the full match which is what you're interested in
        }
        console.log(matches); // This will log an array of matched device names
        return matches; // Returns an array of matched device names
    } else {
        console.log("No devices found or error occurred");
        return [];
    }
};


function getDeviceIdByName(data, deviceName) {
    for (const item of data) {
        if (item.name.toLowerCase() === deviceName.toLowerCase()) {
            return item.device_id;
        }
    }
    return null; // Return null if no device with the given name is found
}
function getRoomNameByDeviceName(data, deviceName) {
    for (const item of data) {
        if (item.name.toLowerCase() === deviceName.toLowerCase()) {
            return item.roomId;
        }
    }
    return null; // Return null if no device with the given name is found
}
// class CommandFactory {
//     static async createCommand(action,roomid,roomdevices) {
      

        

//         console.log(`Action proccesing: "${action}"`);

//         const commandTypePattern = /\b(TURN|turn)\b/i;
//         const statePattern = /\b(ON|OFF)\b/i;
//         const modePattern = /\b(COOL|HEAT|FAN)\b/i;
//         const valuePattern = /\b(\d{1,3})\b/; // Assuming value is always a number

//         const commandTypeMatch = action.match(commandTypePattern);
//         const deviceMatches = await searchDevicesInAction(action); // This now correctly awaits the asynchronous function
//         const stateMatch = action.match(statePattern);
//         const modeMatch = action.match(modePattern);
//         const valueMatch = action.match(valuePattern);

//         const commandType = commandTypeMatch ? commandTypeMatch[0] : '';
//         const device = deviceMatches.length > 0 ? deviceMatches[0].toLowerCase() : ''; // Considering the first matched device
//         const state = stateMatch ? stateMatch[0].toLowerCase() : '';
//         const mode = modeMatch ? modeMatch[0].toLowerCase() : '';
//         const value = valueMatch ? parseInt(valueMatch[0], 10) : '';
//         const deviceid = getDeviceIdByName(roomdevices,device);

//         console.log(`Command Type: ${commandType}`);
//         console.log(`Device: ${device}`);
//         console.log(`State: ${state}`);
//         console.log(`Mode: ${mode}`);
//         console.log(`Value: ${value}`);
//         console.log(`device id: ${deviceid}`);
//      //   console.log("Room details:", JSON.stringify(room, null, 2));
        
//         //  const room =  CallRoom(parsed.conditions[0]); 
//         //  console.log("Room details:", JSON.stringify(room.data, null, 2));  
//         // Instantiate specific command based on parsed action
//         if (state === 'on') {
//             console.log("state is on ");
//             return new TurnDeviceOnCommand(device,mode, value);
//         } else if (state === 'off') {
//             console.log("state is off ");
//             return new TurnDeviceOffCommand(room,device);
//         } else {
//             console.log("Unknown command state.");
//             return null;
//         }
        
        
//     }
// }




class CommandFactory {
    static async createCommand(action, roomid, roomdevices, roomname) {
       
        // Validate roomdevices is an array before proceeding
        if (!Array.isArray(roomdevices)) {
            console.error("Invalid roomdevices data. Expected an array.");
            return null;  // Exit if roomdevices is not an array, and do not execute any command
        }

        const commandTypePattern = /\b(TURN|turn)\b/i;
        const statePattern = /\b(ON|OFF)\b/i;
        const modePattern = /\b(COOL|HEAT|FAN)\b/i;
        const temperaturePattern = /\b(\d{1,3})\b/;

        const commandTypeMatch = action.match(commandTypePattern);
        const deviceMatches = await this.searchDevicesInAction(action); // Ensuring this is correct
        const stateMatch = action.match(statePattern);
        const modeMatch = action.match(modePattern);
        const temperatureMatch = action.match(temperaturePattern);

        const commandType = commandTypeMatch ? commandTypeMatch[0].toLowerCase() : '';
        const device = deviceMatches.length > 0 ? deviceMatches[0] : '';
        const state = stateMatch ? stateMatch[0].toLowerCase() : '';
        const mode = modeMatch ? modeMatch[0].toLowerCase() : '';
        const temperature = temperatureMatch ? parseInt(temperatureMatch[0], 10) : 0;
        const deviceid = this.getDeviceIdByName(roomdevices, device);

        //console.log(`Turning, Device: ${device}, State: ${state}, Mode: ${mode}, Value: ${temperature}, Device ID: ${deviceid}`);

        if (deviceid === null) {
            console.error("Device ID not found for the action. Action cannot be executed.");
            return null;
        }

        if (state === 'on') {
            const turndeviceon = new TurnDeviceOnCommand(deviceid, mode, temperature, device, state);
            return await turndeviceon.execute();
        } else if (state === 'off') {
            const turndeviceoff = new TurnDeviceOffCommand(deviceid, mode, temperature, device, state);
            return await turndeviceoff.execute();
        } else {
            console.log("Unknown command state.");
            return null;
        }
    }

    static async searchDevicesInAction(action) {
        // Implementation for searching devices in action text
        // Adjust the search logic according to your application's needs
        const devices = ['AC', 'light', 'fan', 'heater']; // Example devices
        return devices.filter(device => action.toLowerCase().includes(device.toLowerCase()));
    }

    static getDeviceIdByName(roomdevices, deviceName) {
        const device = roomdevices.find(d => d.name.toLowerCase() === deviceName.toLowerCase());
        return device ? device.device_id : null;
    }
}





module.exports = { CommandFactory };