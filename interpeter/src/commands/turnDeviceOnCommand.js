// const BaseCommand = require('./baseCommand');
// const Device = require("../../../models/Device");
// const RoomDevice = require("../../../models/RoomDevice");
// const axios = require('axios'); 

// class TurnDeviceOnCommand extends BaseCommand {
//     constructor(device,state , mode, details) {
//         super();
//         this.device = device;
//         this.state = state;
//         this.mode = mode;
//         this.details = details;

//     }

//     async execute() {
//         console.log(`Turning ${this.device} ${this.state} ${this.mode} with  details: ${this.details}`);


//         // Assuming this.details is a string like "25 DEGREES"
    
//         // //Extract the numeric part from the string
//     //     const targetTemperature = parseInt(this.details.split(' ')[0], 10); // Convert to integer
//     //     console.log(targetTemperature)
//     //     // // Use default values or values from parsed details
//     //     const { device_id = `${process.env.SENSIBO_DEVICE_ID}`, apiKey = `${process.env.SENSIBO_API_KEY}` } = this.details; // Assuming you add device_id and apiKey to this.details if necessary
//     //     console.log(device_id);
//     //     const deviceUrl = `https://home.sensibo.com/api/v2/pods/${device_id}/acStates?apiKey=${apiKey}`;
//     //     const state = true; // Since we're turning the device on
//     //     const payload = {
//     //         acState: {
//     //             on: state,
//     //             targetTemperature,
//     //             mode: this.mode
//     //         }
//     //     };
        
//     //     try {
//     //         const response = await axios.post(deviceUrl, payload, {
//     //             headers: { 'Content-Type': 'application/json' }
//     //         });
            
//     //         console.log(`Device ${this.device} turned on successfully with temperature: ${targetTemperature} degrees. Response:`, response.data);
            
//     //         // Update the device state in your local database
//     //         const updateResultDevice = await Device.updateOne(
//     //             { device_id: device_id }, // Assuming device_id is the filter criteria
//     //             { $set: { state: "on", lastUpdated: new Date() }}
//     //         );
            
//     //         const updateResultRoomDevice = await RoomDevice.updateOne(
//     //             { device_id: device_id },
//     //             { $set: { state: "on", lastUpdated: new Date() }}
//     //         );
            
//     //         console.log("Device Database update result:", updateResultDevice);
//     //         console.log("RoomDevice Database update result:", updateResultRoomDevice);
//     //     } catch (error) {
//     //         console.error(`Failed to turn on ${this.device}. Error:`, error.message);
//     //     }
//     // }
    

//     // //add new Device turn on 
    
//     // Turn_lights(device,details,place){
//     //     this.details =device;
//     //     this.details = details;
//     //     this.place  = place;
//     //     console.log(`Turning ${this.device} ON with details: ${this.details} in ${this.place}`);

//     //  res.status(200).json({ message: `Light turned ${lightState}, request received successfully`, motionState });


//     }
// }

// module.exports = TurnDeviceOnCommand;



const BaseCommand = require('./baseCommand');
const Device = require("../../../models/Device");
const RoomDevice = require("../../../models/RoomDevice");
const axios = require('axios');
require('dotenv').config();
const {
    TurnON_OFF_LIGHT,
  } = require("./../../../api/sensibo.js");

  
class TurnDeviceOnCommand extends BaseCommand {
    constructor(deviceid, mode, temperature, device, state, data, res, ControlFlag) {
        super();
        this.deviceid = deviceid;
        this.device = device;
        this.state = state;
        this.mode = mode;
        this.temperature = temperature;
        this.data = data;
        this.ControlFlag = ControlFlag;
        this.res = res;
    }

    async execute() {
        console.log(`Executing Turn ${this.state} for ${this.device} in mode ${this.mode} with value ${this.temperature}`);

        switch (this.device.toLowerCase()) {
            case 'ac':
                await this.turnAcOn();
                break;
            case 'bulb':
            case 'light':
                await this.turnLightOn();
                break;
            case 'fan':
                await this.turnFanOn();
                break;
            case 'projector':
                await this.turnProjectorOn();
                break;
            case 'tv':
                await this.turnTVOn();
                break;
            default:
                console.log(`Device type ${this.device} is not supported.`);
                break;
        }
    }

    async turnAcOn() {
        console.log(`Executing Turn On for AC`);

        // Extract the numeric part from the string if necessary
        // const targetTemperature = parseInt(this.temperature, 10); // Convert to integer
        // console.log(targetTemperature);
        // const  apiKey = process.env.SENSIBO_API_KEY ; // Assuming you add device_id and apiKey to this.details if necessary
        // // Use default values or values from parsed details
        // const deviceUrl = `https://home.sensibo.com/api/v2/pods/${this.deviceid}/acStates?apiKey=${apiKey}`;
        // const payload = {
        //     acState: {
        //         on: this.state === 'on',
        //         targetTemperature,
        //         mode: this.mode
        //     }
        // };

        // try {
        //     console.log(`Sending request to URL: ${deviceUrl} with payload:`, payload);
        //     const response = await axios.post(deviceUrl, payload, {
        //         headers: { 'Content-Type': 'application/json' }
        //     });
        //     console.log(`AC turned on successfully at ${targetTemperature} degrees. Response:`, response.data);
        //     await this.updateDeviceState("on");

        //     // Update the device state in your local database
        //     const updateResultDevice = await Device.updateOne(
        //         { device_id: this.deviceid }, // Assuming deviceid is the filter criteria
        //         { $set: { state: "on", lastUpdated: new Date() }}
        //     );

        //     const updateResultRoomDevice = await RoomDevice.updateOne(
        //         { device_id: this.deviceid },
        //         { $set: { state: "on", lastUpdated: new Date() }}
        //     );

        //     console.log("Device Database update result:", updateResultDevice);
        //     console.log("RoomDevice Database update result:", updateResultRoomDevice);
        // } catch (error) {
        //     console.error(`Failed to turn on AC. Error:`, error.message);
        //     if (error.response) {
        //         console.error('Response data:', error.response.data);
        //         console.error('Response status:', error.response.status);
        //         console.error('Response headers:', error.response.headers);
        //     } else if (error.request) {
        //         console.error('Request data:', error.request);
        //     } else {
        //         console.error('Error message:', error.message);
        //     }
        // }
    }

    async turnLightOn() {
        console.log(`Executing Turn On for light`);
        if ( this.ControlFlag === 'manual') {
            try {
                const endpoint = `http://10.100.102.14:5009/on`; // Construct the endpoint URL
                // Make a POST request to the endpoint
                const response = await axios.post(endpoint, { Control:'manual' });
                console.log(response.data); // Log the response data
                return response.data; // Return the response data if needed
            } catch (error) {
                console.error('Error turning on/off light:', error);
                throw error; // Throw the error to handle it in the calling function if needed
            }
        } 
        
    }

    async turnFanOn() {
        console.log(`Turning fan on with details: ${this.details}`);
        // Implementation for turning fan on
        await this.updateDeviceState("on");
    }

    async turnProjectorOn() {
        console.log(`Turning projector on with details: ${this.details}`);
        // Implementation for turning projecזtor on
        await this.updateDeviceState("on");
    }

    async turnTVOn() {
        console.log(`Turning TV on with details: ${this.details}`);
        // Implementation for turning TV on
        await this.updateDeviceState("on");
    }

    async updateDeviceState(state) {
        const updateResultDevice = await Device.updateOne({ device_id: this.deviceid }, { $set: { state: state, lastUpdated: new Date() }});
        const updateResultRoomDevice = await RoomDevice.updateOne({ device_id: this.deviceid }, { $set: { state: state, lastUpdated: new Date() }});
        console.log("Database update result:", updateResultDevice, updateResultRoomDevice);
    }
}

module.exports = TurnDeviceOnCommand;
