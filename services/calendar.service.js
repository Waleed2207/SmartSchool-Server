const mongoose = require('mongoose');
const CalendarEvent = require('../models/CalendarEvent');
const LinkedList = require('../utils/LinkedList');
const Timer = require('../utils/Timer');
const eventEmitter = require('../utils/eventEmitter');

const eventsLinkedList = new LinkedList();
let isLinkedListInitialized = false;
let eventTimer = null;

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

const createEvent = async ({ title, description, time, user, eventType, space_id, roomName, roomDevices }) => {
  try {
    const event = new CalendarEvent({
      title,
      description,
      time: new Date(time),
      user: new mongoose.Types.ObjectId(user),
      eventType,
      space_id,
      roomName,
      roomDevices: roomDevices.map(device => new mongoose.Types.ObjectId(device))
    });

    await event.save();
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

      const headEventTime = eventsLinkedList.head ? new Date(eventsLinkedList.head.data.time).getTime() : null;
      if (!eventTimer || new Date(updates.time).getTime() < headEventTime) {
        updateEventTimer(updates.time);
      }
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

      const headEventTime = eventsLinkedList.head ? new Date(eventsLinkedList.head.data.time).getTime() : null;
      if (eventTimer && new Date(event._doc.time).getTime() === headEventTime) {
        updateEventTimer();
      }
    } else {
      throw new Error('Event not found or not authorized to delete this event');
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Error deleting event');
  }
};

const updateEventTimer = (time = null) => {
  if (eventTimer) {
    eventTimer.stop();
  }
  if (time) {
    const currentTime = Date.now();
    const eventTime = new Date(time).getTime();
    if (eventTime <= currentTime) {
      console.error('Invalid event time:', new Date(time), `(current time: ${new Date(currentTime)})`);
      return;
    }

    eventTimer = new Timer(async () => {
      const expiredEvent = eventsLinkedList.head;
      if (expiredEvent) {
        console.log('Event expired:', new Date(expiredEvent.data.time));

        eventEmitter.emit('eventExpired', expiredEvent.data);

        eventsLinkedList.remove(expiredEvent.id);
        console.log('Expired event removed from linked list');

        await CalendarEvent.findByIdAndDelete(expiredEvent.id);
        console.log('Expired event removed from the database');

        startEventTimer();
      }
    });
    eventTimer.start(time);
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

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  initializeLinkedList,
};
