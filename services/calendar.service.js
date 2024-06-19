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
    return await CalendarEvent.find({ user: userId, space_id: spaceId }).sort({ time: 1 });
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

const createEvent = async ({ title, description, time, user, eventType, space_id, roomDevices, roomName, repeat = 'none', repeatCount = 0, raspberryPiIP, roomDevicesID, room_id, state }) => {
  try {
    console.log('Creating event with data:', { title, description, time, user, eventType, space_id, roomDevices, roomName, repeat, repeatCount, raspberryPiIP, roomDevicesID });

    const event = new CalendarEvent({
      title,
      description,
      time: new Date(time),
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
      state,
    });

    await event.save();
    eventsLinkedList.add(event._id.toString(), event._doc);
    eventsLinkedList.print();

    updateEventTimer();

    return event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Error creating event');
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

const deleteEvent = async (eventId, userId) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(eventId),
      user: new mongoose.Types.ObjectId(userId),
    });

    if (event) {
      const removed = eventsLinkedList.remove(eventId);
      if (!removed) {
        console.warn('Event ID not found in linked list');
      }
      console.log('Current Linked List Nodes after deletion:');
      eventsLinkedList.print();

      updateEventTimer();
    } else {
      throw new Error('Event not found or not authorized to delete this event');
    }
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

      stateManager.updateState(`${expiredEvent.data.eventType}`, expiredEvent.data);

      const nextOccurrence = getNextOccurrence(expiredEvent.data);
      if (nextOccurrence) {
        expiredEvent.data.time = nextOccurrence;
        expiredEvent.data.repeatCount = expiredEvent.data.repeatCount - 1;
        if (expiredEvent.data.repeatCount > 0) {
          eventsLinkedList.update(expiredEvent.id, expiredEvent.data);
          await CalendarEvent.findByIdAndUpdate(expiredEvent.id, { time: nextOccurrence, repeatCount: expiredEvent.data.repeatCount });
          console.log('Scheduled next occurrence of repeating event:', nextOccurrence);
        } else {
          await removeExpiredEvent(expiredEvent);
        }
      } else {
        await removeExpiredEvent(expiredEvent);
      }

      startEventTimer();
    }
  } catch (error) {
    console.error('Error handling expired event:', error);
  }
};

const removeExpiredEvent = async (expiredEvent) => {
  eventsLinkedList.remove(expiredEvent.id);
  console.log('Expired event removed from linked list');
  await CalendarEvent.findByIdAndDelete(expiredEvent.id);
  console.log('Expired event removed from the database');
};

const handleImmediateExpiration = async () => {
  try {
    const expiredEvent = eventsLinkedList.head;
    if (expiredEvent) {
      console.log('Immediate expiration of event:', expiredEvent.data);

      stateManager.updateState(`${expiredEvent.data.eventType}`, expiredEvent.data);
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
  initializeLinkedList,
};
