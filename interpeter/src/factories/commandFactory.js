const TurnDeviceOnCommand = require('../commands/turnDeviceOnCommand');
const TurnDeviceOffCommand = require('../commands/turnDeviceOffCommand');
const { getDevices } = require('../../../services/devices.service');
const { getAllRoomIds } = require('../../../services/rooms.service');
const Device = require("../../../models/Device");

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




class CommandFactory {
    static async createCommand(action, roomid, roomdevices, roomname) {
        console.log(`Action processing: "${action}"`);

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

        console.log(`Turning, Device: ${device}, State: ${state}, Mode: ${mode}, Value: ${temperature}, Device ID: ${deviceid}`);

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