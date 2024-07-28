const eventEmitter = require('events');
const eventEmitterInstance = new eventEmitter();

class StateManager {
  constructor(eventTypes = []) {
    this.states = {
      motion: null,
      humidity: null,
      timer: null,
      temperature: null,
      eventExpired: null,
      lecture: null, // Add lecture context here
      party: null, // Add Party context here
      holiday: null, // Add holiday context here
      weekend: null, // Add weekend context here
    };

    eventTypes.forEach(eventType => {
      if (!this.states.hasOwnProperty(eventType)) {
        this.states[eventType] = null;
      }
    });
  }

  updateState(context, data) {
    if (!this.states.hasOwnProperty(context)) {
      throw new Error(`Unknown context: ${context}`);
    }

    this.states[context] = data;
    eventEmitterInstance.emit(`${context}Event`, data);
  }
}

module.exports = { eventEmitter: eventEmitterInstance, StateManager };
