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

        const commandType = parts[0]; // Already converted to uppercase
        const device = parts[1].toLowerCase(); // Devices may be case-sensitive
        const state = parts[2]; // Already uppercase
        const details = parts.slice(3).join(' '); // Any additional details after the state

        switch (commandType) {
            case 'TURN':
                // Based on the state, return the corresponding command
                if (state === 'ON') {
                    return new TurnDeviceOnCommand(device, details);
                } else if (state === 'OFF') {
                    return new TurnDeviceOffCommand(device, details);
                } else {
                    // Handle other states or return an error
                    throw new Error(`Unknown state for TURN command: ${state}`);
                }
            // ... handle other command types
            default:
                throw new Error(`Unknown command type: ${commandType}`);
        }
    }
}

module.exports = { CommandFactory };

