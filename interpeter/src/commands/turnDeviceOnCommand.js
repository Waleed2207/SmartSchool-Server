const BaseCommand = require('./baseCommand');
const Device = require("../../../models/Device");
const RoomDevice = require("../../../models/RoomDevice");
const axios = require('axios');
const DeviceDictionary = require('../../../controllers/DeviceDictionary');


class TurnDeviceOnCommand extends BaseCommand 
{

    
    constructor(device,mode , details) {
        console.log("TurnDeviceCommand constructor");
        super();
        this.device = device;
        this.mode = mode;
        this.details = details;
        console.log(`Device: ${device}`);
        console.log(`Mode: ${mode}`);
        console.log(`Value: ${details}`);
        this.execute();
        
    }

    async execute() 
    {
        console.log("we are going to turn On device");
        console.log(this.device)
        

        switch (this.device.toLowerCase()) {
           
            case 'light':
                console.log(`device : ${this.device} `);
                break;
            case 'ac' :
                console.log(`device : ${this.device} mode: ${this.mode}, Details: ${this.details}`);
                break; 
            // You can add more cases here for other devices
        }
         /*
        // Assuming this.details is a string like "25 DEGREES"
    
        // //Extract the numeric part from the string
        
        //const targetTemperature = parseInt(this.details.split(' ')[0], 10); // Convert to integer
        const targetTemperature = this.details;
        console.log(targetTemperature)
        
        // // Use default values or values from parsed details
        const { device_id = `${process.env.SENSIBO_DEVICE_ID}`, apiKey = `${process.env.SENSIBO_API_KEY}` } = this.details; // Assuming you add device_id and apiKey to this.details if necessary
        console.log(device_id);
        const deviceUrl = `https://home.sensibo.com/api/v2/pods/${device_id}/acStates?apiKey=${apiKey}`;
        const state = true; // Since we're turning the device on
        const payload = {
            acState: {
                on: state,
                targetTemperature,
                mode: this.mode
            }
        };
        
        try {
            const response = await axios.post(deviceUrl, payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log(`Device ${this.device} turned on successfully with temperature: ${targetTemperature} degrees. Response:`, response.data);
            
            // Update the device state in your local database
            const updateResultDevice = await Device.updateOne(
                { device_id: device_id }, // Assuming device_id is the filter criteria
                { $set: { state: "on", lastUpdated: new Date() }}
            );
            
            const updateResultRoomDevice = await RoomDevice.updateOne(
                { device_id: device_id },
                { $set: { state: "on", lastUpdated: new Date() }}
            );
            
            console.log("Device Database update result:", updateResultDevice);
            console.log("RoomDevice Database update result:", updateResultRoomDevice);
        } catch (error) {
            console.error(`Failed to turn on ${this.device}. Error:`, error.message);
        }
        */
    }
    

    //add new Device turn on 
    
    Turn_lights(device,details,place){
        this.details =device;
        this.details = details;
        this.place  = place;
        console.log(`Turning ${this.device} ON with details: ${this.details} in ${this.place}`);

    }
    
}

module.exports = TurnDeviceOnCommand;
