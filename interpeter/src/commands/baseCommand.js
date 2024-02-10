//Command classes for actions
class BaseCommand {
    execute() {
        throw new Error("This method must be implemented by subclasses.");
    }
    constructor(){
        console.log("basecommand constructor");
    }
}

module.exports = {BaseCommand};