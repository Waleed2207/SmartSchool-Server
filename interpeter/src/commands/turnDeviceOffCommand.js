
const BaseCommand = require('./baseCommand');
const DeviceDictionary = require('../../../controllers/DeviceDictionary');

class TurnDeviceOnCommand extends BaseCommand {
   
    constructor(device, details) {
        super();
        this.device = device;
        this.details = details;
    }

    execute() 
    {
        console.log("we are going to turn Off device");
        console.log(`Turning ${this.device} Off with details: ${this.details}`);
        switch (roomName) {
            case 'ac':
                console.log("ac is off");
                break;
            case 'light':
                console.log("light is off");
                break;
            case 'fan':
                console.log("fan is off");
                break;  
            case 'bulb': 
                console.log("bulb is off");
                break;  
            default:
                break;
        }
    }

    
}

module.exports = TurnDeviceOnCommand;
