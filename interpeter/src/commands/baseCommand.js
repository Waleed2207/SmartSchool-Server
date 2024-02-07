//Command classes for actions
class BaseCommand {
    execute() {
        throw new Error("This method must be implemented by subclasses.");
    }
}

module.exports = BaseCommand;