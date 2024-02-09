const BaseCommand = require('./baseCommand');
const Device = require("../../../models/Device");
const RoomDevice = require("../../../models/RoomDevice");
const axios = require('axios'); 

class TurnDeviceOnCommand extends BaseCommand {
    constructor(device, details) {
        super();
        this.device = device;
        this.details = details;
    }

    async execute() {
        console.log(`Turning ${this.device} ON with details: ${this.details}`);
        // Assuming this.details is a string like "25 DEGREES"
    
        // Extract the numeric part from the string
        const targetTemperature = parseInt(this.details.split(' ')[0], 10); // Convert to integer
        console.log(targetTemperature)
        // // Use default values or values from parsed details
        // const { device_id = '4ahpAkJ9', apiKey = '4yBVKxwgGQ5ctusFFpnGXplO04u73M', mode = 'cool' } = this.details; // Assuming you add device_id and apiKey to this.details if necessary
    
        // const deviceUrl = `https://home.sensibo.com/api/v2/pods/${device_id}/acStates?apiKey=${apiKey}`;
        // const state = true; // Since we're turning the device on
        // const payload = {
        //     acState: {
        //         on: state,
        //         targetTemperature,
        //         mode: 'cool'
        //     }
        // };
        
        // try {
        //     const response = await axios.post(deviceUrl, payload, {
        //         headers: { 'Content-Type': 'application/json' }
        //     });
            
        //     console.log(`Device ${this.device} turned on successfully with temperature: ${targetTemperature} degrees. Response:`, response.data);
            
        //     // Update the device state in your local database
        //     const updateResultDevice = await Device.updateOne(
        //         { device_id: device_id }, // Assuming device_id is the filter criteria
        //         { $set: { state: "on", lastUpdated: new Date() }}
        //     );
            
        //     const updateResultRoomDevice = await RoomDevice.updateOne(
        //         { device_id: device_id },
        //         { $set: { state: "on", lastUpdated: new Date() }}
        //     );
            
        //     console.log("Device Database update result:", updateResultDevice);
        //     console.log("RoomDevice Database update result:", updateResultRoomDevice);
        // } catch (error) {
        //     console.error(`Failed to turn on ${this.device}. Error:`, error.message);
        // }
    }
    

    //add new Device turn on 
    /*
    Turn_lights(device,details,place){
        this.details =device;
        this.details = details;
        this.place  = place;
        console.log(`Turning ${this.device} ON with details: ${this.details} in ${this.place}`);

    }
    */
}

module.exports = TurnDeviceOnCommand;
