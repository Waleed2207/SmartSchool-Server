
const BaseCommand = require('./baseCommand');


class TurnDeviceOnCommand extends BaseCommand {
    constructor(device, details) {
        super();
        this.device = device;
        this.details = details;
    }

    execute() 
    {
        console.log(`Turning ${this.device} Off with details: ${this.details}`);
    }
}

module.exports = TurnDeviceOnCommand;
