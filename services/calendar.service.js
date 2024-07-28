// // v1.
// const mongoose = require('mongoose');
// const CalendarEvent = require('../models/CalendarEvent');
// const LinkedList = require('../utils/LinkedList');
// const Timer = require('../utils/Timer');
// const { StateManager } = require('../statemanager/stateManager');

// const eventsLinkedList = new LinkedList();
// let isLinkedListInitialized = false;
// let eventTimer = null;
// const stateManager = new StateManager();

// const isValidObjectId = (id) => {
//   return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
// };

// const getAllEvents = async (userId, spaceId) => {
//   try {
//     return await CalendarEvent.find({ user: userId, space_id: spaceId }).sort({ time: 1 });
//   } catch (error) {
//     console.error('Error fetching all events:', error);
//     throw new Error('Error fetching all events');
//   }
// };

// const getEventById = async (eventId, userId) => {
//   try {
//     const event = await CalendarEvent.findOne({
//       _id: new mongoose.Types.ObjectId(eventId),
//       user: new mongoose.Types.ObjectId(userId),
//     });
//     return event;
//   } catch (error) {
//     console.error('Error fetching event by ID:', error);
//     throw new Error('Error fetching event');
//   }
// };

// const initializeLinkedList = async () => {
//   try {
//     if (!isLinkedListInitialized) {
//       const events = await CalendarEvent.find().sort({ time: 1 });
//       events.forEach((event) => {
//         if (!eventsLinkedList.contains(event._id.toString())) {
//           eventsLinkedList.add(event._id.toString(), event._doc);
//         }
//       });
//       console.log('Linked list initialized from database.');
//       eventsLinkedList.print();
//       isLinkedListInitialized = true;

//       startEventTimer();
//     } else {
//       console.log('Linked list is already initialized.');
//     }
//   } catch (error) {
//     console.error('Error initializing linked list:', error);
//   }
// };

// const createEvent = async ({ title, description, time, user, eventType, space_id, roomDevices, roomName, repeat = 'none', repeatCount = 0, raspberryPiIP, roomDevicesID, room_id, state }) => {
//   try {
//     console.log('Creating event with data:', { title, description, time, user, eventType, space_id, roomDevices, roomName, repeat, repeatCount, raspberryPiIP, roomDevicesID });

//     const event = new CalendarEvent({
//       title,
//       description,
//       time: new Date(time),
//       user: new mongoose.Types.ObjectId(user),
//       eventType,
//       space_id,
//       roomDevices,
//       roomName,
//       repeat,
//       repeatCount,
//       raspberryPiIP,
//       roomDevicesID,
//       room_id,
//       state,
//     });

//     await event.save();
//     eventsLinkedList.add(event._id.toString(), event._doc);
//     eventsLinkedList.print();

//     updateEventTimer();

//     return event;
//   } catch (error) {
//     console.error('Error creating event:', error);
//     throw new Error('Error creating event');
//   }
// };

// const updateEvent = async (eventId, userId, updates) => {
//   try {
//     if (updates.time) {
//       updates.time = new Date(updates.time);
//     }

//     if (updates.roomDevices) {
//       updates.roomDevices = updates.roomDevices.map((device) => {
//         if (!isValidObjectId(device)) {
//           throw new Error(`Invalid ObjectId: ${device}`);
//         }
//         return new mongoose.Types.ObjectId(device);
//       });
//     }

//     const event = await CalendarEvent.findOneAndUpdate(
//       { _id: new mongoose.Types.ObjectId(eventId), user: new mongoose.Types.ObjectId(userId) },
//       updates,
//       { new: true }
//     );

//     if (event) {
//       eventsLinkedList.update(eventId, event._doc);
//       updateEventTimer();
//     }

//     return event;
//   } catch (error) {
//     console.error('Error updating event:', error);
//     throw new Error('Error updating event');
//   }
// };

// const deleteEvent = async (eventId, userId) => {
//   try {
//     const event = await CalendarEvent.findOneAndDelete({
//       _id: new mongoose.Types.ObjectId(eventId),
//       user: new mongoose.Types.ObjectId(userId),
//     });

//     if (event) {
//       const removed = eventsLinkedList.remove(eventId);
//       if (!removed) {
//         console.warn('Event ID not found in linked list');
//       }
//       console.log('Current Linked List Nodes after deletion:');
//       eventsLinkedList.print();

//       updateEventTimer();
//     } else {
//       throw new Error('Event not found or not authorized to delete this event');
//     }
//   } catch (error) {
//     console.error('Error deleting event:', error);
//     throw new Error('Error deleting event');
//   }
// };

// const startEventTimer = () => {
//   const nextEventTime = eventsLinkedList.head ? eventsLinkedList.head.data.time : null;

//   if (nextEventTime) {
//     console.log('Next event time:', nextEventTime);
//     updateEventTimer(nextEventTime);
//   } else {
//     console.log('No events in the linked list');
//   }
// };

// const updateEventTimer = () => {
//   if (eventTimer) {
//     eventTimer.stop();
//   }

//   if (eventsLinkedList.head) {
//     const nextEventTime = eventsLinkedList.head.data.time;
//     const currentTime = new Date();
//     const delay = nextEventTime - currentTime;
//     if (delay > 0) {
//       eventTimer = new Timer(async () => {
//         await handleExpiredEvent();
//       });
//       eventTimer.start(nextEventTime);
//     } else {
//       console.warn('Event time is in the past:', nextEventTime);
//       handleImmediateExpiration();
//     }
//   }
// };

// const handleExpiredEvent = async () => {
//   try {
//     const expiredEvent = eventsLinkedList.head;
//     if (expiredEvent) {
//       console.log('Event expired:', new Date(expiredEvent.data.time));

//       stateManager.updateState(`${expiredEvent.data.eventType}`, expiredEvent.data);

//       const nextOccurrence = getNextOccurrence(expiredEvent.data);
//       if (nextOccurrence) {
//         expiredEvent.data.time = nextOccurrence;
//         expiredEvent.data.repeatCount = expiredEvent.data.repeatCount - 1;
//         if (expiredEvent.data.repeatCount > 0) {
//           eventsLinkedList.update(expiredEvent.id, expiredEvent.data);
//           await CalendarEvent.findByIdAndUpdate(expiredEvent.id, { time: nextOccurrence, repeatCount: expiredEvent.data.repeatCount });
//           console.log('Scheduled next occurrence of repeating event:', nextOccurrence);
//         } else {
//           await removeExpiredEvent(expiredEvent);
//         }
//       } else {
//         await removeExpiredEvent(expiredEvent);
//       }

//       startEventTimer();
//     }
//   } catch (error) {
//     console.error('Error handling expired event:', error);
//   }
// };

// const removeExpiredEvent = async (expiredEvent) => {
//   eventsLinkedList.remove(expiredEvent.id);
//   console.log('Expired event removed from linked list');
//   await CalendarEvent.findByIdAndDelete(expiredEvent.id);
//   console.log('Expired event removed from the database');
// };

// const handleImmediateExpiration = async () => {
//   try {
//     const expiredEvent = eventsLinkedList.head;
//     if (expiredEvent) {
//       console.log('Immediate expiration of event:', expiredEvent.data);

//       stateManager.updateState(`${expiredEvent.data.eventType}`, expiredEvent.data);
//       await removeExpiredEvent(expiredEvent);

//       startEventTimer();
//     }
//   } catch (error) {
//     console.error('Error handling immediate expiration:', error);
//   }
// };

// const getNextOccurrence = (event) => {
//   const { repeat, time } = event;
//   const currentTime = new Date(time);

//   switch (repeat) {
//     case 'daily':
//       return new Date(currentTime.setDate(currentTime.getDate() + 1));
//     case 'weekly':
//       return new Date(currentTime.setDate(currentTime.getDate() + 7));
//     case 'monthly':
//       return new Date(currentTime.setMonth(currentTime.getMonth() + 1));
//     default:
//       return null;
//   }
// };

// module.exports = {
//   createEvent,
//   getAllEvents,
//   getEventById,
//   updateEvent,
//   deleteEvent,
//   initializeLinkedList,
// };

const mongoose = require('mongoose');
const CalendarEvent = require('../models/CalendarEvent');
const LinkedList = require('../utils/LinkedList');
const Timer = require('../utils/Timer');
const { StateManager } = require('../statemanager/stateManager');

const eventsLinkedList = new LinkedList();
let isLinkedListInitialized = false;
let eventTimer = null;
const stateManager = new StateManager();

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
};

const getAllEvents = async (userId, spaceId) => {
  try {
    const events = await CalendarEvent.find({ user: userId, space_id: spaceId }).sort({ time: 1 });
    console.log('Fetched events from DB:', events);

    const mergedEvents = {};

    events.forEach(event => {
      console.log('Processing event:', event);
      const baseTitle = event.title.replace(/ \((Start|End)\)$/, '');
      if (!mergedEvents[baseTitle]) {
        mergedEvents[baseTitle] = {
          _id: event._id,
          title: baseTitle,
          description: event.description,
          startTime: event.state === 'on' ? event.time : null,
          endTime: event.state === 'off' ? event.time : null,
          user: event.user,
          eventType: event.eventType,
          space_id: event.space_id,
          roomDevices: event.roomDevices,
          roomDevicesID: event.roomDevicesID,
          roomName: event.roomName,
          state: 'active',
          room_id: event.room_id,
          repeat: event.repeat,
          repeatCount: event.repeatCount,
          raspberryPiIP: event.raspberryPiIP,
          startEventId: event.state === 'on' ? event._id : null,
          endEventId: event.state === 'off' ? event._id : null,
        };
      } else {
        if (event.state === 'on') {
          mergedEvents[baseTitle].startTime = event.time;
          mergedEvents[baseTitle].startEventId = event._id;
        } else if (event.state === 'off') {
          mergedEvents[baseTitle].endTime = event.time;
          mergedEvents[baseTitle].endEventId = event._id;
        }
      }
    });

    const mergedEventsArray = Object.values(mergedEvents).filter(event => event.startTime && event.endTime);

    console.log('Merged events:', mergedEventsArray);
    return mergedEventsArray;
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw new Error('Error fetching all events');
  }
};

const getEventById = async (eventId, userId) => {
  try {
    const event = await CalendarEvent.findOne({
      _id: new mongoose.Types.ObjectId(eventId),
      user: new mongoose.Types.ObjectId(userId),
    });
    return event;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw new Error('Error fetching event');
  }
};

const initializeLinkedList = async () => {
  try {
    if (!isLinkedListInitialized) {
      const events = await CalendarEvent.find().sort({ time: 1 });
      events.forEach((event) => {
        if (!eventsLinkedList.contains(event._id.toString())) {
          eventsLinkedList.add(event._id.toString(), event._doc);
        }
      });
      console.log('Linked list initialized from database.');
      eventsLinkedList.print();
      isLinkedListInitialized = true;

      startEventTimer();
    } else {
      console.log('Linked list is already initialized.');
    }
  } catch (error) {
    console.error('Error initializing linked list:', error);
  }
};

const createEvent = async ({ title, description, startTime, endTime, user, eventType, space_id, roomDevices, roomName, repeat = 'none', repeatCount = 0, raspberryPiIP, roomDevicesID, room_id, state }) => {
  try {
    console.log('Creating event with data:', { title, description, startTime, endTime, user, eventType, space_id, roomDevices, roomName, repeat, repeatCount, raspberryPiIP, roomDevicesID });

    const startEvent = new CalendarEvent({
      title: `${title} (Start)`,
      description,
      time: new Date(startTime),
      user: new mongoose.Types.ObjectId(user),
      eventType,
      space_id,
      roomDevices,
      roomName,
      repeat,
      repeatCount,
      raspberryPiIP,
      roomDevicesID,
      room_id,
      state: 'on',
    });

    const endEvent = new CalendarEvent({
      title: `${title} (End)`,
      description,
      time: new Date(endTime),
      user: new mongoose.Types.ObjectId(user),
      eventType,
      space_id,
      roomDevices,
      roomName,
      repeat,
      repeatCount,
      raspberryPiIP,
      roomDevicesID,
      room_id,
      state: 'off',
    });

    await startEvent.save();
    await endEvent.save();
    eventsLinkedList.add(startEvent._id.toString(), startEvent._doc);
    eventsLinkedList.add(endEvent._id.toString(), endEvent._doc);
    eventsLinkedList.print();

    updateEventTimer();

    return { startEvent, endEvent };
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Error creating event');
  }
};

const updateMergedEvent = async (eventId, userId, updates) => {
  try {
    const startEvent = await CalendarEvent.findOne({ _id: new mongoose.Types.ObjectId(eventId), user: new mongoose.Types.ObjectId(userId) });
    if (!startEvent) {
      throw new Error('Start event not found');
    }

    const baseTitle = startEvent.title.replace(' (Start)', '');
    const endEvent = await CalendarEvent.findOne({ title: `${baseTitle} (End)`, user: userId });

    if (!endEvent) {
      throw new Error('End event not found');
    }

    if (updates.startTime) {
      startEvent.time = new Date(updates.startTime);
    }
    if (updates.endTime) {
      endEvent.time = new Date(updates.endTime);
    }
    if (updates.title) {
      startEvent.title = `${updates.title} (Start)`;
      endEvent.title = `${updates.title} (End)`;
    }
    if (updates.description) {
      startEvent.description = updates.description;
      endEvent.description = updates.description;
    }
    if (updates.roomDevices) {
      startEvent.roomDevices = updates.roomDevices;
      endEvent.roomDevices = updates.roomDevices;
    }
    if (updates.roomDevicesID) {
      startEvent.roomDevicesID = updates.roomDevicesID;
      endEvent.roomDevicesID = updates.roomDevicesID;
    }

    await startEvent.save();
    await endEvent.save();

    eventsLinkedList.update(startEvent._id.toString(), startEvent._doc);
    eventsLinkedList.update(endEvent._id.toString(), endEvent._doc);
    updateEventTimer();

    return { startEvent, endEvent };
  } catch (error) {
    console.error('Error updating merged event:', error);
    throw new Error('Error updating merged event');
  }
};

const deleteMergedEvent = async (eventId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error(`Invalid event ID format: ${eventId}`);
    }

    const startEvent = await CalendarEvent.findOne({ _id: new mongoose.Types.ObjectId(eventId), user: new mongoose.Types.ObjectId(userId) });
    const baseTitle = startEvent.title.replace(' (Start)', '');
    const endEvent = await CalendarEvent.findOne({ title: `${baseTitle} (End)`, user: userId });

    if (!startEvent || !endEvent) {
      throw new Error('Corresponding start or end event not found');
    }

    await CalendarEvent.deleteMany({ _id: { $in: [startEvent._id, endEvent._id] } });

    eventsLinkedList.remove(startEvent._id.toString());
    eventsLinkedList.remove(endEvent._id.toString());
    updateEventTimer();

    return { startEvent, endEvent };
  } catch (error) {
    console.error('Error deleting merged event:', error);
    throw new Error('Error deleting merged event');
  }
};

const updateEvent = async (eventId, userId, updates) => {
  try {
    if (updates.time) {
      updates.time = new Date(updates.time);
    }

    if (updates.roomDevices) {
      updates.roomDevices = updates.roomDevices.map((device) => {
        if (!isValidObjectId(device)) {
          throw new Error(`Invalid ObjectId: ${device}`);
        }
        return new mongoose.Types.ObjectId(device);
      });
    }

    const event = await CalendarEvent.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(eventId), user: new mongoose.Types.ObjectId(userId) },
      updates,
      { new: true }
    );

    if (event) {
      eventsLinkedList.update(eventId, event._doc);
      updateEventTimer();
    }

    return event;
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Error updating event');
  }
};

const deleteEvent = async (startEventId, endEventId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(startEventId) || !mongoose.Types.ObjectId.isValid(endEventId)) {
      console.error(`Invalid event ID format: ${startEventId}, ${endEventId}`);
      throw new Error(`Invalid event ID format: ${startEventId}, ${endEventId}`);
    }

    const events = await CalendarEvent.find({
      _id: { $in: [new mongoose.Types.ObjectId(startEventId), new mongoose.Types.ObjectId(endEventId)] },
      user: new mongoose.Types.ObjectId(userId)
    });

    if (events.length !== 2) {
      console.error('Start or end event not found or not authorized to delete these events');
      throw new Error('Start or end event not found or not authorized to delete these events');
    }

    await CalendarEvent.deleteMany({ _id: { $in: [startEventId, endEventId] } });

    [startEventId, endEventId].forEach(eventId => eventsLinkedList.remove(eventId.toString()));
    updateEventTimer();

    return { startEventId, endEventId };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Error deleting event');
  }
};

const startEventTimer = () => {
  const nextEventTime = eventsLinkedList.head ? eventsLinkedList.head.data.time : null;

  if (nextEventTime) {
    console.log('Next event time:', nextEventTime);
    updateEventTimer(nextEventTime);
  } else {
    console.log('No events in the linked list');
  }
};

const updateEventTimer = () => {
  if (eventTimer) {
    eventTimer.stop();
  }

  if (eventsLinkedList.head) {
    const nextEventTime = eventsLinkedList.head.data.time;
    const currentTime = new Date();
    const delay = nextEventTime - currentTime;
    if (delay > 0) {
      eventTimer = new Timer(async () => {
        await handleExpiredEvent();
      });
      eventTimer.start(nextEventTime);
    } else {
      console.warn('Event time is in the past:', nextEventTime);
      handleImmediateExpiration();
    }
  }
};

const handleExpiredEvent = async () => {
  try {
    const expiredEvent = eventsLinkedList.head;
    if (expiredEvent) {
      console.log('Event expired:', new Date(expiredEvent.data.time));

      await stateManager.updateState(`${expiredEvent.data.eventType}`, expiredEvent.data);

      if (expiredEvent.data.state === 'off') {
        await removeExpiredEvent(expiredEvent);
      } else {
        eventsLinkedList.remove(expiredEvent.id);
        console.log('Start event removed from linked list');
      }

      startEventTimer();
    }
  } catch (error) {
    console.error('Error handling expired event:', error);
  }
};

const removeExpiredEvent = async (expiredEvent) => {
  try {
    const baseTitle = expiredEvent.data.title.replace(' (End)', '');
    const startEvent = await CalendarEvent.findOne({ title: `${baseTitle} (Start)`, user: expiredEvent.data.user });

    if (startEvent) {
      const startEventId = startEvent._id.toString();
      const endEventId = expiredEvent.data._id.toString();

      eventsLinkedList.remove(startEventId);
      eventsLinkedList.remove(endEventId);

      console.log('Expired end event removed from linked list');

      await CalendarEvent.deleteMany({ _id: { $in: [startEventId, endEventId] } });

      console.log('Expired start and end events removed from the database');
    } else {
      console.warn('Start event not found for end event:', expiredEvent.data);
    }
  } catch (error) {
    console.error('Error removing expired events:', error);
  }
};

const handleImmediateExpiration = async () => {
  try {
    const expiredEvent = eventsLinkedList.head;
    if (expiredEvent) {
      console.log('Immediate expiration of event:', expiredEvent.data);

      await stateManager.updateState(`${expiredEvent.data.eventType}`, expiredEvent.data);
      await removeExpiredEvent(expiredEvent);

      startEventTimer();
    }
  } catch (error) {
    console.error('Error handling immediate expiration:', error);
  }
};

const getNextOccurrence = (event) => {
  const { repeat, time } = event;
  const currentTime = new Date(time);

  switch (repeat) {
    case 'daily':
      return new Date(currentTime.setDate(currentTime.getDate() + 1));
    case 'weekly':
      return new Date(currentTime.setDate(currentTime.getDate() + 7));
    case 'monthly':
      return new Date(currentTime.setMonth(currentTime.getMonth() + 1));
    default:
      return null;
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  deleteMergedEvent,
  updateMergedEvent,
  initializeLinkedList,
};
