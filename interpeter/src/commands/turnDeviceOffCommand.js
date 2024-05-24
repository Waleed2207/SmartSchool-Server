const BaseCommand = require('./baseCommand');
const Device = require("../../../models/Device");
const RoomDevice = require("../../../models/RoomDevice");
const axios = require('axios');
require('dotenv').config();

class TurnDeviceOnOffCommand extends BaseCommand {
    constructor(deviceid, mode, value, device, state, apiKey = process.env.SENSIBO_API_KEY) {
        super();
        this.deviceid = deviceid;
        this.device = device;
        this.state = state; // 'on' or 'off'
        this.mode = mode;
        this.details = value;
        this.apiKey = apiKey;
    }

    async execute() {
        console.log(`Executing Turn ${this.state} for ${this.device} in mode ${this.mode} with value ${this.details}`);
        let string = " ";
        
      
        // Start switch-case to handle different device types
        switch (this.device.toLowerCase()) {
            case 'ac':
                string = await this.turnAc();
                break;
            case 'light':
                string = await this.turnLight();
            case 'bulb':
                string = await this.turnLight();
                break;
            case 'fan':
                string = await this.turnFan();
                break;
            case 'projector':
                string = await this.turnProjector();
                break;
            case 'tv':
                string = await this.turnTV();
                break;
            default:
                console.log(`Device type ${this.device} is not supported.`);
                break;
        }
        return string;
    }

    async turnAc() {

        const targetTemperature = parseInt(this.details, 10);
        if (!isNaN(targetTemperature)) {
            // Proceed with using targetTemperature
            console.log(`Target temperature: ${targetTemperature}`);
        } else {
            console.error('Error: Unable to parse target temperature from details.');
        }
        console.log(`Target temperature: ${targetTemperature}`);
        const deviceUrl = `https://home.sensibo.com/api/v2/pods/${this.deviceid}/acStates?apiKey=${this.apiKey}`;
        const payload = {
            acState: {
                on: this.state === 'on',
                targetTemperature: targetTemperature,
                mode: this.mode
            }
        };

        try {
            const response = await axios.post(deviceUrl, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log(`AC turned ${this.state} successfully at ${targetTemperature} degrees. Response:`, response.data);
            await this.updateDeviceState(this.state);
        } catch (error) {
            console.error(`Failed to turn ${this.state} AC. Error:`, error.message);
        }
        return "turn AC Off"
    }

    async turnLight() {
        console.log(`Turning light ${this.state} with details: ${this.details}`);
        await this.updateDeviceState(this.state);
        return "turn Light Off";
    }

    async turnFan() {
        console.log(`Turning fan ${this.state} with details: ${this.details}`);
        await this.updateDeviceState(this.state);
        return "turn Fan Off";
    }

    async turnProjector() {
        console.log(`Turning projector ${this.state} with details: ${this.details}`);
        await this.updateDeviceState(this.state);
        return "turn Projector Off";
    }

    async turnTV() {
        console.log(`Turning TV ${this.state} with details: ${this.details}`);
        await this.updateDeviceState(this.state);
        return "turn TV Off";
    }

    async updateDeviceState(state) {
        
        const updateResultDevice = await Device.updateOne({ device_id: this.deviceid }, { $set: { state, lastUpdated: new Date() }});
        const updateResultRoomDevice = await RoomDevice.updateOne({ device_id: this.deviceid }, { $set: { state, lastUpdated: new Date() }});
        console.log("Database update result:", updateResultDevice, updateResultRoomDevice);
       
    }
}

module.exports = TurnDeviceOnOffCommand;
