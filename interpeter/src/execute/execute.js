const { StateManager, eventEmitter } = require('../../../statemanager/stateManager');
const { CommandFactory } = require('../factories/commandFactory');
const { interpretRuleByName, interpretRuleByNameHumD, interpretRuleByNameCalendar } = require('../interpreter/interpreter');
const Activity = require("../../../models/Activity"); // Ensure this path is correct
const { getCurrentSeason } = require('../../../services/time.service'); // Import the getCurrentSeason function
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes
const { sendEventData } = require('../../../services/event.service');

let isListenerRegistered = false;

// Debounce mechanism
function debounce(fn, delay) {
  let debounceTimeout = null;
  return function (...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => fn(...args), delay);
  };
}

function execute() {
  return new Promise((resolve, reject) => {
    if (!isListenerRegistered) {
      eventEmitter.on('motionEvent', debounce(async (data) => {
        try {
          if (!data || typeof data.motionState === 'undefined' || !data.RoomName) {
            console.error("Incomplete data received:", data);
            reject(new Error("Incomplete data received."));
            return;
          }
          const { event, spaceId, lightState, motionState, deviceId, RoomName, res, roomId, _User_Oid } = data;

          const controlSuccess = await simulateLightControl(deviceId, lightState);
          if (!controlSuccess) {
            throw new Error('Failed to control device state.');
          }
          // Parse the event string
          const [person, motionStateStr, ...roomNameParts] = event.split(" ");
          const parsedMotionState = (motionStateStr === 'on') ? 'in' : 'not in';
          const parsedRoomName = roomNameParts.join(" ");

          console.log(`Parsed event data - Person: ${person}, Motion State: ${parsedMotionState}, Room Name: ${parsedRoomName}`);
          console.log(_User_Oid);
          const currentActivity = await getCurrentActivityForUser(_User_Oid);
          const currentSeason = await getCurrentSeason();
          const Context = {
            detection: motionState,
            activity: currentActivity,
            season: currentSeason,
          };

          let Condition = `${person} ${parsedMotionState} ${parsedRoomName}`;

          await interpretRuleByName(Condition, data, res, Context, true);
          resolve();
        } catch (error) {
          console.error("Error processing motionEvent:", error);
          if (data.res && !data.res.headersSent) {
            data.res.status(500).json({ error: `Failed to process the request: ${error.message}` });
          }
          reject(error);
        }
      }, 1000)); // Debounce with a delay of 1 second
      
      eventEmitter.on('temperatureEvent', debounce(async (data) => {
        try {
          const { event, temperature, humidity, roomId, roomName, spaceId, deviceId, raspberryPiIP, user_oid } = data;
      
          console.log('Temperature Event Data:', data);
          let Condition = event;
          console.log('Event Data Condition:', Condition);
      
          await interpretRuleByNameHumD(Condition, data, false); // false indicates that `res` should not be passed
          resolve();
        } catch (error) {
          console.error("Error processing temperatureEvent:", error);
          reject(error);
        }
      }, 1000));
      eventEmitter.on('humidityEvent', debounce(async (data) => {
        try {
          const { event, temperature, humidity, roomId, roomName, spaceId, deviceId, raspberryPiIP, user_oid } = data;
      
          console.log('humidity  Event Data:', data);
          let Condition = event;
          console.log('Event Data Condition:', Condition);
      
          await interpretRuleByNameHumD(Condition, data, false); // false indicates that `res` should not be passed
          resolve();
        } catch (error) {
          console.error("Error processing humidityEvent:", error);
          reject(error);
        }
      }, 1000));

        eventEmitter.on('lectureEvent', debounce(async (data) => {
            try {
                console.log('Event expired :', data);
                const { eventType, state, room_id, raspberryPiIP, space_id, roomName } = data;

                const parsedState = state === 'on' ? 'in' : 'not in';
                const Condition = `${eventType} ${parsedState} ${roomName}`;
                console.log(`Parsed event data - Person: ${eventType}, Motion State: ${parsedState}, Room Name: ${roomName}`);

                const currentSeason = await getCurrentSeason();
                const Context = {
                    detection: parsedState,
                    season: currentSeason,
                };

                let Control = 'manual';
                await interpretRuleByNameCalendar(Condition, data, true,res=null, Context, Control);
                console.log('Rule interpreted successfully');
            } catch (error) {
                console.error('Error sending event data:', error);
            }
        }, 1000));

      eventEmitter.on('partyEvent', debounce(async (data) => {
        try {
            console.log('Event expired :', data);
            const { eventType, state, room_id, raspberryPiIP, space_id, roomName } = data;

            const parsedState = state === 'on' ? 'in' : 'not in';
            const Condition = `${eventType} ${parsedState} ${roomName}`;
            console.log(`Parsed event data - Person: ${eventType}, Motion State: ${parsedState}, Room Name: ${roomName}`);

            const currentSeason = await getCurrentSeason();
            const Context = {
                detection: parsedState,
                season: currentSeason,
            };

            let Control = 'manual';
            await interpretRuleByNameCalendar(Condition, data, true,res=null, Context, Control);
            console.log('Rule interpreted successfully');
        } catch (error) {
            console.error('Error sending event data:', error);
        }

      }, 1000));
      eventEmitter.on('holidayEvent', debounce(async (data) => {
        try {
            console.log('Event expired :', data);
            const { eventType, state, room_id, raspberryPiIP, space_id, roomName } = data;

            const parsedState = state === 'on' ? 'in' : 'not in';
            const Condition = `${eventType} ${parsedState} ${roomName}`;
            console.log(`Parsed event data - Person: ${eventType}, Motion State: ${parsedState}, Room Name: ${roomName}`);

            const currentSeason = await getCurrentSeason();
            const Context = {
                detection: parsedState,
                season: currentSeason,
            };

            let Control = 'manual';
            await interpretRuleByNameCalendar(Condition, data, true,res=null, Context, Control);
            console.log('Rule interpreted successfully');
        } catch (error) {
            console.error('Error sending event data:', error);
        }
      }, 1000));
      eventEmitter.on('weekendEvent', debounce(async (data) => {      
        try {
            console.log('Event expired :', data);
            const { eventType, state, room_id, raspberryPiIP, space_id, roomName } = data;

            const parsedState = state === 'on' ? 'in' : 'not in';
            const Condition = `${eventType} ${parsedState} ${roomName}`;
            console.log(`Parsed event data - Person: ${eventType}, Motion State: ${parsedState}, Room Name: ${roomName}`);

            const currentSeason = await getCurrentSeason();
            const Context = {
                detection: parsedState,
                season: currentSeason,
            };

            let Control = 'manual';
            await interpretRuleByNameCalendar(Condition, data, true,res=null, Context, Control);
            console.log('Rule interpreted successfully');
        } catch (error) {
            console.error('Error sending event data:', error);
        }
      }, 1000));

      isListenerRegistered = true;
    } else {
      resolve(); // Resolve immediately if listener is already set up
    }
  });
}

async function getCurrentActivityForUser(userId) {
  const cachedActivity = cache.get(`activity_${userId}`);
  if (cachedActivity) {
    return cachedActivity;
  }

  try {
    const activity = await Activity.findOne({ user: userId }).sort({ createdAt: -1 }).exec(); // Assuming activities have a createdAt field
    if (!activity) {
      console.warn(`No activity found for user ${userId}. Returning default activity.`);
      return 'default_activity'; // Replace with an appropriate default value
    }
    cache.set(`activity_${userId}`, activity.name);
    return activity.name;
  } catch (error) {
    console.error(`Error fetching current activity for user ${userId}:`, error);
    throw new Error('Failed to fetch current activity.');
  }
}

async function simulateLightControl(deviceId, state) {
  return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}

module.exports = {
  execute,
};
