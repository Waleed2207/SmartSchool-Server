const TurnDeviceOnCommand = require('../commands/turnDeviceOnCommand');
const TurnDeviceOffCommand = require('../commands/turnDeviceOffCommand'); // Assuming you have this command
// ... (import other command classes as needed)

class CommandFactory {
    static createCommand(action) {
        // Split the action into parts by space
        const parts = action.toUpperCase().split(' '); // Convert action to uppercase for case-insensitive comparison

        // Ensure the action string has at least three parts: TURN, device, ON/OFF
        if (parts.length < 3) {
            throw new Error(`Invalid action format: ${action}`);
        }
        
        console.log(`Processing: "${action}"`);

<<<<<<< HEAD
        // Regex for each component
        const commandTypePattern = /\bturn\b/i;
        const devicePattern = /\b(light|ac | bulb | tv )\ \b/i;
        const statePattern = /\b(on|off)\b/i;
        const modePattern = /\b(cool|heat|fan)\b/i;
        const valuePattern = /\b(\d{1,3})\b/; // Assuming value is always a number
    
        // Extracting each component
        const commandTypeMatch = action.match(commandTypePattern);
        const deviceMatch = action.match(devicePattern);
        const stateMatch = action.match(statePattern);
        const modeMatch = action.match(modePattern);
        const valueMatch = action.match(valuePattern);
    
        // Processing extracted parts, assigning default '' if not found
        const commandType = commandTypeMatch ? commandTypeMatch[0] : '';
        const device = deviceMatch ? deviceMatch[0].toLowerCase() : '';
        const state = stateMatch ? stateMatch[0].toLowerCase() : '';
        const mode = modeMatch ? modeMatch[0].toLowerCase() : '';
        const value = valueMatch ? parseInt(valueMatch[0], 10) : '';
    
        // Output the results
        console.log(`Command Type: ${commandType}`);
        console.log(`Device: ${device}`);
        console.log(`State: ${state}`);
        console.log(`Mode: ${mode}`);
        console.log(`Value: ${value}`);
        console.log('---'); // Separator for clarity
=======
        const commandType = parts[0]; // Already converted to uppercase
        console.log(commandType);
        const device = parts[1].toLowerCase(); // Devices may be case-sensitive
        console.log(device);
        const state = parts[2]; // Already uppercase
        console.log(state);
        const mode = parts[4]; //
        const details = parts.slice(7).join(' '); // Any additional details after the state
        console.log(details);

        switch (commandType) {
            case 'TURN':
                // Based on the state, return the corresponding command
                if (state === 'ON') {
                    return new TurnDeviceOnCommand(device,state,mode, details);
                } else if (state === 'OFF') {
                    return new TurnDeviceOffCommand(device,state,mode, details);
                } else {
                    // Handle other states or return an error
                    throw new Error(`Unknown state for TURN command: ${state}`);
                }
            // ... handle other command types
            default:
                throw new Error(`Unknown command type: ${commandType}`);
        }
>>>>>>> origin/SameerDevNew
    }
}

module.exports = { CommandFactory };

