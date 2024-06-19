
// const BaseCommand = require('./baseCommand');


// class TurnDeviceOnCommand extends BaseCommand {
//     constructor(device, details) {
//         super();
//         this.device = device;
//         this.details = details;
//     }

//     execute() 
//     {
//         console.log(`Turning ${this.device} Off with details: ${this.details}`);
//     }
// }

// module.exports = TurnDeviceOnCommand;

const BaseCommand = require('./baseCommand');
const Device = require("../../../models/Device");
const RoomDevice = require("../../../models/RoomDevice");
const axios = require('axios');
require('dotenv').config();

class TurnDeviceOnOffCommand extends BaseCommand {
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
        console.log("Context "+ this.ControlFlag);
        console.log(`Executing Turn ${this.state} for ${this.device} in mode ${this.mode} with value ${this.temperature}`);
        
        // Start switch-case to handle different device types
        switch (this.device.toLowerCase()) {
            case 'ac':
                await this.turnAc();
                break;
            case 'light':
            case 'bulb':
                await this.turnLight();
                break;
            case 'fan':
                await this.turnFan();
                break;
            case 'projector':
                await this.turnProjector();
                break;
            case 'tv':
                await this.turnTV();
                break;
            default:
                console.log(`Device type ${this.device} is not supported.`);
                break;
        }
    }

    async turnAc() {
        console.log(`Executing Turn OFF for AC `);
        // Extract the numeric part from the string if necessary
        // const targetTemperature = parseInt(this.temperature, 10); // Convert to integer
        // console.log(targetTemperature);
        // const  apiKey = process.env.SENSIBO_API_KEY ; // Assuming you add device_id and apiKey to this.details if necessary
        // // Use default values or values from parsed details
        // const deviceUrl = `https://home.sensibo.com/api/v2/pods/${this.deviceid}/acStates?apiKey=${apiKey}`;
        // const payload = {
        //     acState: {
        //         on: false,
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
        //     await this.updateDeviceState("off");

        //     // Update the device state in your local database
        //     const updateResultDevice = await Device.updateOne(
        //         { device_id: this.deviceid }, // Assuming deviceid is the filter criteria
        //         { $set: { state: "off", lastUpdated: new Date() }}
        //     );

        //     const updateResultRoomDevice = await RoomDevice.updateOne(
        //         { device_id: this.deviceid },
        //         { $set: { state: "off", lastUpdated: new Date() }}
        //     );

        //     console.log("Device Database update result:", updateResultDevice);
        //     console.log("RoomDevice Database update result:", updateResultRoomDevice);
        // } catch (error) {
        //     console.error(`Failed to turn off AC. Error:`, error.message);
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

    async turnLight() {
        console.log(`Executing Turn Off for light`);
        if( this.ControlFlag === 'manual') {
            try {
                const endpoint = `http://10.100.102.14:5009/off`; // Construct the endpoint URL
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

    async turnFan() {
        console.log(`Turning fan ${this.state} with details: ${this.details}`);
        await this.updateDeviceState(this.state);
    }

    async turnProjector() {
        console.log(`Turning projector ${this.state} with details: ${this.details}`);
        await this.updateDeviceState(this.state);
    }

    async turnTV() {
        console.log(`Turning TV ${this.state} with details: ${this.details}`);
        await this.updateDeviceState(this.state);
    }

    async updateDeviceState(state) {
        
        const updateResultDevice = await Device.updateOne({ device_id: this.deviceid }, { $set: { state, lastUpdated: new Date() }});
        const updateResultRoomDevice = await RoomDevice.updateOne({ device_id: this.deviceid }, { $set: { state, lastUpdated: new Date() }});
        // console.log("Database update result:", updateResultDevice, updateResultRoomDevice);
    }
}

module.exports = TurnDeviceOnOffCommand;