// listeners/eventListener.js
const eventEmitter = require('../utils/eventEmitter');
const { sendEventData } = require('../services/event.service');

eventEmitter.on('eventExpired', async (eventData) => {
  console.log('Event expired:', eventData);

  try {
    await sendEventData(eventData);
    console.log('Event data sent successfully:', eventData);
  } catch (error) {
    console.error('Error sending event data:', error);
  }
});

module.exports = {};
