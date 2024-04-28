const TurnDeviceOnCommand = require('../commands/turnDeviceOnCommand');
const TurnDeviceOffCommand = require('../commands/turnDeviceOffCommand');
const { getDevices } = require('../../../services/devices.service');

const constructDeviceRegex = async () => {
    try {
        const devices = await getDevices();
        // Assuming each device has a 'name' property. Adjust if your data structure is different.
        const deviceNames = devices.map(device => device.name.toLowerCase());
        const pattern = deviceNames.join("|"); // Creates a string that joins all device names with '|'
        console.log("device pattern: " + pattern);
        // Include the 'g' flag for a global search
        return new RegExp(`\\b(${pattern})\\b`, 'ig'); // Case insensitive and global match
    } catch (err) {
        console.log("Error constructing device regex: ", err);
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

class CommandFactory {
    static async createCommand(action) {
      

        

        console.log(`Processing: "${action}"`);

        const commandTypePattern = /\bTURN\b/i;
        const statePattern = /\b(ON|OFF)\b/i;
        const modePattern = /\b(COOL|HEAT|FAN)\b/i;
        const valuePattern = /\b(\d{1,3})\b/; // Assuming value is always a number

        const commandTypeMatch = action.match(commandTypePattern);
        const deviceMatches = await searchDevicesInAction(action); // This now correctly awaits the asynchronous function
        const stateMatch = action.match(statePattern);
        const modeMatch = action.match(modePattern);
        const valueMatch = action.match(valuePattern);

        const commandType = commandTypeMatch ? commandTypeMatch[0] : '';
        const device = deviceMatches.length > 0 ? deviceMatches[0].toLowerCase() : ''; // Considering the first matched device
        const state = stateMatch ? stateMatch[0].toLowerCase() : '';
        const mode = modeMatch ? modeMatch[0].toLowerCase() : '';
        const value = valueMatch ? parseInt(valueMatch[0], 10) : '';

        console.log(`Command Type: ${commandType}`);
        console.log(`Device: ${device}`);
        console.log(`State: ${state}`);
        console.log(`Mode: ${mode}`);
        console.log(`Value: ${value}`);
        console.log('---');
        /*
        // Instantiate specific command based on parsed action
        if (state === 'on') {
            console.log("state is on ");
            return new TurnDeviceOnCommand(device,mode, value);
        } else if (state === 'off') {
            console.log("state is off ");
            return new TurnDeviceOffCommand(device);
        } else {
            console.log("Unknown command state.");
            return null;
        }
        */
        
    }
}

module.exports = { CommandFactory };
