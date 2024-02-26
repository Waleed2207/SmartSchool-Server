
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
    }
}

module.exports = TurnDeviceOnCommand;
