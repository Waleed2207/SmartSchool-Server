// const TurnDeviceOnCommand = require('../commands/turnDeviceOnCommand');
// const TurnDeviceOffCommand = require('../commands/turnDeviceOffCommand'); // Assuming you have this command
// // ... (import other command classes as needed)

// class CommandFactory {
//     static createCommand(action) {
//         // Split the action into parts by space
//         const parts = action.toUpperCase().split(' '); // Convert action to uppercase for case-insensitive comparison

//         // Ensure the action string has at least three parts: TURN, device, ON/OFF
//         if (parts.length < 3) {
//             throw new Error(`Invalid action format: ${action}`);
//         }

//         const commandType = parts[0]; // Already converted to uppercase
//         console.log(commandType);
//         const device = parts[1].toLowerCase(); // Devices may be case-sensitive
//         console.log(device);
//         const state = parts[2]; // Already uppercase
//         console.log(state);
//         const mode = parts[4]; //
//         const details = parts.slice(7).join(' '); // Any additional details after the state
//         console.log(details);

//         switch (commandType) {
//             case 'TURN':
//                 // Based on the state, return the corresponding command
//                 if (state === 'ON') {
//                     return new TurnDeviceOnCommand(device,state,mode, details);
//                 } else if (state === 'OFF') {
//                     return new TurnDeviceOffCommand(device,state,mode, details);
//                 } else {
//                     // Handle other states or return an error
//                     throw new Error(`Unknown state for TURN command: ${state}`);
//                 }
//             // ... handle other command types
//             default:
//                 throw new Error(`Unknown command type: ${commandType}`);
//         }
//     }
// }

// module.exports = { CommandFactory };

const TurnDeviceOnCommand = require('../commands/turnDeviceOnCommand');
const TurnDeviceOffCommand = require('../commands/turnDeviceOffCommand');
const { getDevices } = require('../../../services/devices.service');
const { getAllRoomIds } = require('../../../services/rooms.service');
const Room = require("../../../models/Room");
const Device = require("../../../models/Device.js");
const RoomDevice = require("../../../models/RoomDevice");

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
    static async createCommand(action, roomid, roomdevices,context, roomname, data, res) {
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
        const ControlFlag = context.control;
        // console.log(`Turning, Device: ${device}, State: ${state}, Mode: ${mode}, Value: ${temperature}, Device ID: ${deviceid}`);

        if (deviceid === null) {
            console.error("Device ID not found for the action. Action cannot be executed.");
            return null;
        }

        if (state === 'on') {
            const turndeviceon = new TurnDeviceOnCommand(deviceid, mode, temperature, device, state, data, res, ControlFlag);
            if (res && !res.headersSent) {
                res.status(200).json({
                    message: `Light turned ${data.lightState}, request received successfully`,
                    motionState: data.motionState
                });
            }
            this.updateDatabase(deviceid, roomid, data.motionState, data.lightState);
            return await turndeviceon.execute();
        } else if (state === 'off') {
            const turndeviceoff = new TurnDeviceOffCommand(deviceid, mode, temperature, device, state, data, res, ControlFlag);
            if (res && !res.headersSent) {
                res.status(200).json({
                    message: `Light turned ${data.lightState}, request received successfully`,
                    motionState: data.motionState
                });
            }
            this.updateDatabase(deviceid, roomid, data.motionState, data.lightState);
            return await turndeviceoff.execute();
        } else {
            console.log("Unknown command state.");
            return null;
        }
    }
    static async updateDatabase(deviceid, roomId, motionState, lightState) {
        motionState = lightState === 'on';
        // Update the room's 'motionDetected' field
        await Room.updateOne({ id: roomId }, { $set: { motionDetected: motionState } });
        console.log(`Simulated light turned ${lightState} for Room ID: ${roomId}`);

        // Update the specific device's state
        await Device.updateOne({ device_id: deviceid }, { $set: { state: lightState } });
        console.log(`Device state updated for Device ID: ${deviceid}`);

        // Additionally, update the RoomDevice state
        await RoomDevice.updateOne(
            { room_id: roomId, device_id: deviceid },
            { $set: { state: lightState } }
        );
    }

    static async searchDevicesInAction(action) {
        // Implementation for searching devices in action text
        // Adjust the search logic according to your application's needs
        const devices = ['AC', 'light', 'Fan', 'Bulb', 'Projector', 'TV']; // Example devices
        return devices.filter(device => action.toLowerCase().includes(device.toLowerCase()));
    }

    static getDeviceIdByName(roomdevices, deviceName) {
        const device = roomdevices.find(d => d.name.toLowerCase() === deviceName.toLowerCase());
        return device ? device.device_id : null;
    }
}

module.exports = { CommandFactory };
