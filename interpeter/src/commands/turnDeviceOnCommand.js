
const BaseCommand = require('./baseCommand');
const Device = require("../../../models/Device");
const RoomDevice = require("../../../models/RoomDevice");
const axios = require('axios');
require('dotenv').config();

class TurnDeviceOnCommand extends BaseCommand {
    constructor(deviceid, mode, value, device, state, apiKey = process.env.SENSIBO_API_KEY) {
        super();
        this.deviceid = deviceid;
        this.device = device;
        this.state = state;
        this.mode = mode;
        this.details = value;
        this.apiKey = apiKey;
    }

    async execute() {
        console.log(`Executing Turn On for ${this.device} in mode ${this.mode} with value ${this.details}`);
        
        // Start switch-case to handle different device types
        switch (this.device.toLowerCase()) {
            case 'ac':
                await this.turnAcOn();
                break;
            case 'light':
            case 'bulb':
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
        const targetTemperature = parseInt(this.details.split(' ')[0], 10); // Extract the numeric part from the string like "25 degrees"
        const deviceUrl = `https://home.sensibo.com/api/v2/pods/${this.deviceid}/acStates?apiKey=${this.apiKey}`;
        const payload = {
            acState: {
                on: true,
                targetTemperature: targetTemperature,
                mode: this.mode
            }
        };

        try {
            const response = await axios.post(deviceUrl, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log(`AC turned on successfully at ${targetTemperature} degrees. Response:`, response.data);
            await this.updateDeviceState("on");
        } catch (error) {
            console.error(`Failed to turn on AC. Error:`, error.message);
        }
    }

    async turnLightOn() {
        console.log(`Turning light on with details: ${this.details}`);
        // res.status(200).json({ message: `Light turned ${lightState}, request received successfully`, motionState });

        await this.updateDeviceState("on");
    }

    async turnFanOn() {
        console.log(`Turning fan on with details: ${this.details}`);
        // Implementation for turning fan on
        await this.updateDeviceState("on");
    }

    async turnProjectorOn() {
        console.log(`Turning projector on with details: ${this.details}`);
        // Implementation for turning projector on
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
