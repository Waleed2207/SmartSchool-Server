// services/eventService.js
const sendEventData = async (eventData) => {
    try {
      // Implement your logic to send event data to another service
      console.log('Sending event data:', eventData);
      // Example: Sending data to an external API (replace with actual implementation)
      // await axios.post('https://example.com/api/events', eventData);
    } catch (error) {
      console.error('Error sending event data:', error);
      throw error;
    }
  };
  
  module.exports = {
    sendEventData
  };
  