const mongoose = require('mongoose');
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, initializeLinkedList } = require('../services/calendar.service');
const LinkedList = require('../utils/LinkedList');
const Timer = require('../utils/Timer');
const Device = require('../models/Device'); // Assuming you have a Device model
const Room = require('../models/Room'); // Assuming you have a Room model
const { sendEventData } = require('../services/event.service');

const eventsLinkedList = new LinkedList();
let isLinkedListInitialized = false;
let eventTimer = null;

const fetchDeviceMap = async (space_id) => {

  
  try {
    const devices = await Device.find({space_id:space_id});
    console.log('Fetched devices from database:', devices); // Log fetched devices

    const deviceMap = {};
    devices.forEach(device => {
      if (device.name && device.device_id) {
        deviceMap[device.name.toLowerCase()] = device.device_id; // Convert keys to lower case
      }
    });
    console.log('Device map:', deviceMap); // Log the created device map
    return deviceMap;
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw new Error('Failed to fetch devices');
  }
};

const fetchRoomIdByName = async (roomName) => {
  try {
    const room = await Room.findOne({ name: roomName });
    if (!room) {
      throw new Error(`Room not found: ${roomName}`);
    }
    return room.id;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw new Error('Failed to fetch room');
  }
};

const addEvent = async (req, res) => {
  try {
    const { title, description, time, eventType, space_id, roomDevices, roomName, repeat = 'none', repeatCount = 0, raspberryPiIP, state } = req.body;
    console.log("Raspberry Pi IP:", raspberryPiIP);
    console.log("State of event is ", state);

    if (!title || !time || !eventType || !space_id || !roomDevices || !roomName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const deviceMap = await fetchDeviceMap(space_id);

    // Derive device IDs from roomDevices in a case-insensitive manner
    const roomDevicesID = [];
    const invalidDevices = [];
    roomDevices.forEach((device) => {
      const deviceId = deviceMap[device.toLowerCase()]; // Convert device name to lower case
      if (!deviceId) {
        invalidDevices.push(device);
      } else {
        roomDevicesID.push(deviceId);
      }
    });

    if (invalidDevices.length > 0) {
      console.error('Invalid device names:', invalidDevices);
      return res.status(400).json({ error: `Invalid device names: ${invalidDevices.join(', ')}` });
    }

    console.log('Derived roomDevicesID:', roomDevicesID);

    // Fetch room ID by room name
    const room_id = await fetchRoomIdByName(roomName);
    console.log('Fetched room ID:', room_id);

    const event = await createEvent({
      title,
      description,
      time,
      user: req.user._id,
      eventType,
      space_id,
      roomDevices,
      roomDevicesID, // Use derived deviceIDs directly
      roomName, // Include roomName in the event
      room_id, // Use fetched room ID
      repeat,
      repeatCount,
      raspberryPiIP,
      state,
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
      const deviceMap = await fetchDeviceMap();
      updates.roomDevices = updates.roomDevices.map((device) => {
        const deviceId = deviceMap[device.toLowerCase()]; // Convert device name to lower case
        if (!deviceId || !mongoose.Types.ObjectId.isValid(deviceId)) {
          throw new Error(`Invalid device ID: ${device}`);
        }
        return deviceId;
      });
    }

    if (updates.roomName) {
      const room_id = await fetchRoomIdByName(updates.roomName);
      updates.room_id = room_id;
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
