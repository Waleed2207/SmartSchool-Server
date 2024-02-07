const BaseCommand = require('./baseCommand');

class TurnDeviceOnCommand extends BaseCommand {
    constructor(device, details) {
        super();
        this.device = device;
        this.details = details;
    }

    execute() {
        console.log(`Turning ${this.device} ON with details: ${this.details}`);
        
       //Actual implmetaion of th turning on devices
    }

    //add new Device turn on 
    /*
    Turn_lights(device,details,place){
        this.details =device;
        this.details = details;
        this.place  = place;
        console.log(`Turning ${this.device} ON with details: ${this.details} in ${this.place}`);

    }
    */
}

module.exports = TurnDeviceOnCommand;
