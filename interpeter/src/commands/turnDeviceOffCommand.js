
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
const fs = require('fs').promises;
const path = require('path');
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
        console.log(`Executing Turn ${this.deviceid} ${this.state} for ${this.device} in mode ${this.mode} with value ${this.temperature}`);
        
        switch (this.device.toLowerCase()) {
            case 'ac':
                await this.turnAc();
                break;
            case 'bulb':
                await this.turnBulb(this.data.raspberryPiIP);
                break;
            case 'light':
                await this.turnLight(this.data.raspberryPiIP);
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
        const targetTemperature = parseInt(this.temperature, 10); // Convert to integer
        console.log(targetTemperature);
        const  apiKey = process.env.SENSIBO_API_KEY ; // Assuming you add device_id and apiKey to this.details if necessary
        // Use default values or values from parsed details
        const deviceUrl = `https://home.sensibo.com/api/v2/pods/${this.deviceid}/acStates?apiKey=${apiKey}`;
        const payload = {
            acState: {
                on: false,
                targetTemperature,
                mode: this.mode
            }
        };

        try {
            // console.log(`Sending request to URL: ${deviceUrl} with payload:`, payload);
            const response = await axios.post(deviceUrl, payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            // console.log(`AC turned off successfully at ${targetTemperature} degrees. Response:`, response.data);
            // await this.updateDeviceState("off");

            // Update the device state in your local database
            const updateResultDevice = await Device.updateOne(
                { device_id: this.deviceid }, // Assuming deviceid is the filter criteria
                { $set: { state: "off", lastUpdated: new Date() }}
            );

            const updateResultRoomDevice = await RoomDevice.updateOne(
                { device_id: this.deviceid },
                { $set: { state: "off", lastUpdated: new Date() }}
            );

            // console.log("Device Database update result:", updateResultDevice);
            // console.log("RoomDevice Database update result:", updateResultRoomDevice);
        } catch (error) {
            console.error(`Failed to turn off AC. Error:`, error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        }
    }

    async turnLight(raspberryPiIP) {
        console.log(`Executing Turn ${this.state} for light with RaspberryPi IP: ${raspberryPiIP}`);
        if (this.ControlFlag === 'manual') {
            try {
                const endpoint = await this.getNgrokUrl(raspberryPiIP);
                const response = await axios.post(`${endpoint}/off`, { Control: 'manual' });
                // console.log(response.data);
                await this.updateDeviceState(this.state);
                return response.data;
            } catch (error) {
                console.error('Error turning on/off light:', error);
                throw error;
            }
        }
    }
    async turnBulb(raspberryPiIP) {
        console.log(`Executing Turn ${this.state} for Bulb with RaspberryPi IP: ${raspberryPiIP}`);
        await this.changeFeatureState(this.deviceid, this.state, raspberryPiIP);
        // await this.updateDeviceState(this.state);
    }

    async changeFeatureState(deviceId, state, rasp_ip) {
        const endpoint = await this.getNgrokUrl(rasp_ip);

        const apiUrl = `${endpoint}/api-mindolife/change_feature_state`;
        try {
            const valuePost= state ? 'on' : 'off';
            const response = await axios.post(apiUrl, { deviceId, state: valuePost });

            console.log("Response from Flask server:", response.data);
            if (response.status === 200) {
                console.log("Feature state changed successfully", response.data);
                const roomId = "38197016";

                const updateResultDevice = await Device.updateOne(
                    { device_id: deviceId },
                    { $set: { state, lastUpdated: new Date() } }
                );
                const updateResultRoomDevice = await RoomDevice.updateOne(
                    { room_id: roomId, device_id: deviceId },
                    { $set: { state, lastUpdated: new Date() } }
                );
                console.log("Database update result:", updateResultDevice, updateResultRoomDevice);
                return { statusCode: 200, data: response.data };
            } else {
                throw new Error("Failed to change feature state via API.");
            }
        } catch (error) {
            console.error(` ${deviceId}: ${error.message}`);
            throw error;
        }
    }

    async turnFan() {
        console.log(`Turning fan ${this.state}`);
        await this.updateDeviceState(this.state);
    }

    async turnProjector() {
        console.log(`Turning projector ${this.state}`);
        await this.updateDeviceState(this.state);
    }

    async turnTV() {
        console.log(`Turning TV ${this.state}`);
        await this.updateDeviceState(this.state);
    }

    async updateDeviceState(state) {
        const updateResultDevice = await Device.updateOne({ device_id: this.deviceid }, { $set: { state, lastUpdated: new Date() } });
        const updateResultRoomDevice = await RoomDevice.updateOne({ device_id: this.deviceid }, { $set: { state, lastUpdated: new Date() } });
        console.log(`Device state updated for Device ID:, ${this.deviceid }` );
    }

    async getNgrokUrl(rasp_ip) {
        const config = await loadConfig();
        const ngrokUrl = config[rasp_ip];

        if (!ngrokUrl) {
            throw new Error(`IP address ${rasp_ip} not found in the configuration file`);
        }

        return ngrokUrl;
    }
}

const loadConfig = async () => {
    try {
        const filePath = path.resolve(__dirname, './../../../api/endpoint/rasp_pi.json');
        console.log(filePath);
        console.log(`Loading configuration from: ${filePath}`);

        try {
            await fs.access(filePath);
        } catch (err) {
            throw new Error(`Configuration file does not exist at: ${filePath}`);
        }

        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        throw new Error(`Error loading configuration: ${err.message}`);
    }
};

module.exports = TurnDeviceOnOffCommand;