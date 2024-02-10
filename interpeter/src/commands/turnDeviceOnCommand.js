const { BaseCommand } = require('./baseCommand');


class TurnDeviceOnCommand extends BaseCommand {
    constructor(device, details, mode) {
        super();
        this.device = device;
        this.details = details;
        this.mode = mode; // Add a mode attribute
    }

    async execute() {
        console.log(`Turning ${this.device} ON in ${this.mode} mode with details: ${this.details}`);

        // Implementation for turning the device on with the specified mode
        // Assuming this.details can include temperature, and this.mode can be 'hot' or 'cold'
        const targetTemperature = parseInt(this.details.split(' ')[0], 10);

        // Logic to construct the payload with mode
        const payload = {
            acState: {
                on: true,
                targetTemperature,
                mode: this.mode // Use the mode here
            }
        };

        // Example of sending the payload to an API or another service (commented out)
        /*
        try {
            const response = await axios.post(deviceUrl, payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(`Device ${this.device} turned on successfully in ${this.mode} mode with temperature: ${targetTemperature} degrees. Response:`, response.data);
        } catch (error) {
            console.error(`Failed to turn on ${this.device} in ${this.mode} mode. Error:`, error.message);
        }
        */
    }
}


module.exports = { TurnDeviceOnCommand };