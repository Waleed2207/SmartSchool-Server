const BaseCommand = require('./baseCommand');
const Device = require("../../../models/Device");
const RoomDevice = require("../../../models/RoomDevice");
const axios = require('axios'); 

class TurnDeviceOnCommand extends BaseCommand {
    constructor(device,state,mode,value,room) {
        super();
        this.device = device;
        this.state = state;
        this.mode = mode;
        this.details = value; 
        this.room = room;
        //this.space = spaceid;   

    }

    async execute() {
        // console.log(`Turning ${this.device} ${this.state} ${this.mode} with  details: ${this.details}`);
        // console.log(`Turing ${this.device} on ${this.state} in room id ${this.roomid} and Space ID ${this.spaceid}`);
        console.log(`Turing ${this.device} on ${this.state}  at mode ${ this.mode} value is ${this.details} in room id ${this.room} `); 

        // Assuming this.details is a string like "25 DEGREES"
    
        // //Extract the numeric part from the string
    //     const targetTemperature = parseInt(this.details.split(' ')[0], 10); // Convert to integer
    //     console.log(targetTemperature)
    //     // // Use default values or values from parsed details
    //     const { device_id = `${process.env.SENSIBO_DEVICE_ID}`, apiKey = `${process.env.SENSIBO_API_KEY}` } = this.details; // Assuming you add device_id and apiKey to this.details if necessary
    //     console.log(device_id);
    //     const deviceUrl = `https://home.sensibo.com/api/v2/pods/${device_id}/acStates?apiKey=${apiKey}`;
    //     const state = true; // Since we're turning the device on
    //     const payload = {
    //         acState: {
    //             on: state,
    //             targetTemperature,
    //             mode: this.mode
    //         }
    //     };
        
    //     try {
    //         const response = await axios.post(deviceUrl, payload, {
    //             headers: { 'Content-Type': 'application/json' }
    //         });
            
    //         console.log(`Device ${this.device} turned on successfully with temperature: ${targetTemperature} degrees. Response:`, response.data);
            
    //         // Update the device state in your local database
    //         const updateResultDevice = await Device.updateOne(
    //             { device_id: device_id }, // Assuming device_id is the filter criteria
    //             { $set: { state: "on", lastUpdated: new Date() }}
    //         );
            
    //         const updateResultRoomDevice = await RoomDevice.updateOne(
    //             { device_id: device_id },
    //             { $set: { state: "on", lastUpdated: new Date() }}
    //         );
            
    //         console.log("Device Database update result:", updateResultDevice);
    //         console.log("RoomDevice Database update result:", updateResultRoomDevice);
    //     } catch (error) {
    //         console.error(`Failed to turn on ${this.device}. Error:`, error.message);
    //     }
    // }
    

    // //add new Device turn on 
    
    // Turn_lights(device,details,place){
    //     this.details =device;
    //     this.details = details;
    //     this.place  = place;
    //     console.log(`Turning ${this.device} ON with details: ${this.details} in ${this.place}`);

    //  res.status(200).json({ message: `Light turned ${lightState}, request received successfully`, motionState });


    }
}

module.exports = TurnDeviceOnCommand;
