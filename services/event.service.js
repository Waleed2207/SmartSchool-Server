

// services/eventService.js
const sendEventData = async (eventData) => {
    try {
      // Select only the fields you want to send
      const selectedData = {
        title: eventData.title,
        description: eventData.description,
        time: eventData.time,
        eventType: eventData.eventType,
        space_id: eventData.space_id,
        roomDevices: eventData.roomDevices,
        roomName: eventData.roomName,
        room_id : eventData.room_id,
        raspberryPiIP : eventData.raspberryPiIP,
        roomDevicesID: eventData.roomDevicesID,
        state: eventData.state,
      };
      
      // Log the selected data
      console.log('Sending event data:', selectedData);
  
      // Here you would actually send the data, e.g., with an HTTP request
      // await axios.post('YOUR_API_ENDPOINT', selectedData);
  
    } catch (error) {
      console.error('Error sending event data:', error);
      throw error;
    }
  };
  
  module.exports = {
    sendEventData
  };