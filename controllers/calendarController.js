const mongoose = require('mongoose');
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../services/calendar.service');
const LinkedList = require('../utils/LinkedList');
const Timer = require('../utils/Timer');

const eventsLinkedList = new LinkedList();
let isLinkedListInitialized = false;
let eventTimer = null;

const deviceMap = {
  'AC': '60d21b4667d0d8992e610c85',
  'light': '60d21b4667d0d8992e610c86',
  // Add more devices as needed
};

const initializeLinkedList = async () => {
  try {
    if (!isLinkedListInitialized) {
      const events = await getAllEvents();
      events.forEach(event => {
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

const addEvent = async (req, res) => {
  try {
    const { title, description, time, eventType, space_id, roomName, roomDevices } = req.body;

    if (!title || !time || !eventType || !space_id || !roomName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validatedDevices = roomDevices.map((device) => {
      const deviceId = deviceMap[device];
      if (!deviceId || !mongoose.Types.ObjectId.isValid(deviceId)) {
        throw new Error(`Invalid ObjectId: ${device}`);
      }
      return new mongoose.Types.ObjectId(deviceId);
    });

    const event = await createEvent({
      title,
      description,
      time,
      user: req.user._id,
      eventType,
      space_id,
      roomName,
      roomDevices: validatedDevices,
    });

    eventsLinkedList.add(event._id.toString(), event._doc);

    res.status(201).json(event);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Failed to add event' });
  }
};

const getEvents = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const events = await getAllEvents(req.user._id, spaceId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await getEventById(req.params.eventId, req.user._id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Error fetching event' });
  }
};

const updateTheEvent = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.time) {
      updates.time = new Date(updates.time);
      if (isNaN(updates.time.getTime())) {
        return res.status(400).json({ error: 'Invalid time format' });
      }
    }

    if (updates.roomDevices) {
      updates.roomDevices = updates.roomDevices.map((device) => {
        const deviceId = deviceMap[device];
        if (!deviceId || !mongoose.Types.ObjectId.isValid(deviceId)) {
          throw new Error(`Invalid ObjectId: ${device}`);
        }
        return new mongoose.Types.ObjectId(deviceId);
      });
    }

    const event = await updateEvent(req.params.eventId, req.user._id, updates);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
};

const deleteTheEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    await deleteEvent(eventId, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
};

const startEventTimer = () => {
  const nextEventTime = eventsLinkedList.head ? eventsLinkedList.head.data.time : null;

  if (nextEventTime) {
    console.log('Next event time:', nextEventTime);
    eventTimer = new Timer(async () => {
      const eventNode = eventsLinkedList.head;

      if (!eventNode) {
        console.log('No events in the linked list');
        return;
      }

      try {
        await sendEventData(eventNode.data);
      } catch (error) {
        console.error('Error sending event data:', error);
        return;
      }

      eventsLinkedList.remove(eventNode.id);
      console.log('Event data sent and node removed from the linked list');

      startEventTimer();
    });

    eventTimer.start(nextEventTime);
  } else {
    console.log('No events in the linked list');
  }
};

module.exports = {
  addEvent,
  getEvents,
  getEvent,
  updateTheEvent,
  deleteTheEvent,
  initializeLinkedList,
};
