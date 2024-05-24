
const BaseCommand = require('./baseCommand');
const Device = require("../../../models/Device");
const RoomDevice = require("../../../models/RoomDevice");

const axios = require('axios');
require('dotenv').config();

class TurnDeviceOnCommand extends BaseCommand {
    constructor(deviceid, mode, temperature, device, state, apiKey = process.env.SENSIBO_API_KEY) {
        super();
        this.deviceid = deviceid;
        this.device = device;
        this.state = state;
        this.mode = mode;
        this.temperature = temperature;  // Assume temperature is already a number.
        this.apiKey = apiKey;
    }


    async execute() {
        console.log(`Executing Turn On for ${this.device} in mode ${this.mode} with temperature: ${this.temperature}`);
        let string = "";


        switch (this.device.toLowerCase()) {
            case 'ac':
                string = await this.turnAcOn();
                break;
            case 'light':
                string = await this.turnLightOn();
            case 'bulb':
                string = await  this.turnLightOn();
                break;
            case 'fan':
                string = await this.turnFanOn();
                break;
            case 'projector':
                string = await this.turnProjectorOn();
                break;
            case 'tv':
                string =  await this.turnTVOn();
                break;
            default:
                console.log(`Device type ${this.device} is not supported.`);
                break;
        }
        return string;
    }

    async turnAcOn() {
        console.log(`Turning AC on with details: ${this.details}`);
        // const deviceUrl = `https://home.sensibo.com/api/v2/pods/${this.deviceid}/acStates?apiKey=${this.apiKey}`;
        // const payload = {
        //     acState: {
        //         on: true,
        //         targetTemperature: this.temperature,
        //         mode: this.mode
        //     }
        // };

        // try {
        //     const response = await axios.post(deviceUrl, payload, {
        //         headers: { 'Content-Type': 'application/json' }
        //     });

        //     console.log(`AC turned on successfully at ${this.temperature} degrees. Response:`, response.data);
        //     await this.updateDeviceState("on");
        // } catch (error) {
        //     console.error(`Failed to turn on AC. Error:`, error.message);
        // }
        return "turn AC On";
    }
    async turnLightOn() {
        console.log(`Executing Turn On for light`);
        const updateResult = await Device.updateOne(
            { device_id: this.deviceId },
            { $set: { state: 'on' } }
        );
        console.log('Database update result:', updateResult);
        //return updateResult;
        return "turn Light On";
    }

    async turnFanOn() {
        console.log(`Turning fan on with details: ${this.details}`);
        // Implementation for turning fan on
        await this.updateDeviceState("on");
        return "turn Fan On" ; 
    }

    async turnProjectorOn() {
        console.log(`Turning projector on with details: ${this.details}`);
        // Implementation for turning projector on
        await this.updateDeviceState("on");
        return "turn Projector On";
    }

    async turnTVOn() {
        console.log(`Turning TV on with details: ${this.details}`);
        // Implementation for turning TV on
        await this.updateDeviceState("on");
        return "turnTVOn";
    }

    async updateDeviceState(state) {
        const updateResultDevice = await Device.updateOne({ device_id: this.deviceid }, { $set: { state: state, lastUpdated: new Date() }});
        const updateResultRoomDevice = await RoomDevice.updateOne({ device_id: this.deviceid }, { $set: { state: state, lastUpdated: new Date() }});
        console.log("Database update result:", updateResultDevice, updateResultRoomDevice);
    }
}

module.exports = TurnDeviceOnCommand;
