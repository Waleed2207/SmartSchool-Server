const {TurnDeviceOnCommand} = require('../commands/turnDeviceOnCommand');
const {TurnDeviceOffCommand} = require('../commands/turnDeviceOffCommand'); // Assuming you have this command


class CommandFactory {
    static createCommand(action) {
        const parts = action.toUpperCase().split(' ');
        if (parts.length < 3) {
            throw new Error(`Invalid action format: ${action}`);
        }

        const commandType = parts[0];
        const device = parts[1].toLowerCase();
        const state = parts[2];
        let mode = null; // Default mode is null

        // Check for mode in the action parts and extract it
        if (action.toUpperCase().includes('HOT') || action.toUpperCase().includes('COLD')) {
            mode = action.toUpperCase().includes('HOT') ? 'hot' : 'cold';
        }

        const details = parts.slice(3).join(' '); // Additional details

        switch (commandType) {
            case 'TURN':
                if (state === 'ON') {
                    console.log("we are in command factory");
                    try{
                        return new TurnDeviceOnCommand(device, details, mode);
                    }
                    catch (error) {
                        // Handle the error
                        console.error('Error creating TurnDeviceOnCommand:', error.message);
                       
                    }
                    
                } // Add handling for 'OFF' and other commands as needed
                // Other cases...
            default:
                throw new Error(`Unknown command type: ${commandType}`);
        }
    }
}


module.exports = { CommandFactory };

