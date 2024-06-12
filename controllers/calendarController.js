// const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../services/calendar.service');
// const mongoose = require('mongoose');

// const addEvent = async (req, res) => {
//   try {
//     const { title, description, time, eventType, space_id } = req.body;

//     if (!title || !time || !eventType || !space_id) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ error: 'Unauthorized: User ID missing' });
//     }

//     const event = await createEvent({
//       title,
//       description,
//       time,
//       user: req.user._id,
//       eventType,
//       space_id
//     });

//     res.status(201).json(event);
//   } catch (error) {
//     console.error('Error adding event:', error);
//     res.status(500).json({ error: 'Failed to add event' });
//   }
// };

// const getEvents = async (req, res) => {
//   try {
//     const { spaceId } = req.params;

//     console.log('Fetching events for spaceId:', spaceId);

//     const events = await getAllEvents(req.user._id, spaceId);
//     res.json(events);
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     res.status(500).json({ error: 'Error fetching events' });
//   }
// };

// // Other controller methods...

// const getEvent = async (req, res) => {
//   try {
//     const event = await getEventById(req.params.eventId, req.user._id);
//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }
//     res.json(event);
//   } catch (error) {
//     console.error('Error fetching event:', error);
//     res.status(500).json({ error: 'Error fetching event' });
//   }
// };

// const updateTheEvent = async (req, res) => {
//   try {
//     const updates = req.body;
//     if (updates.time) {
//       updates.time = new Date(updates.time);
//       if (isNaN(updates.time.getTime())) {
//         return res.status(400).json({ error: 'Invalid time format' });
//       }
//     }
    
//     const event = await updateEvent(req.params.eventId, req.user._id, updates);
//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }
//     res.json(event);
//   } catch (error) {
//     console.error('Error updating event:', error);
//     res.status(500).json({ error: 'Error updating event' });
//   }
// };

// const deleteTheEvent = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const userId = req.user._id;

//     if (!eventId) {
//       return res.status(400).json({ error: 'Event ID is required' });
//     }

//     await deleteEvent(eventId, userId);
//     res.status(204).send();
//   } catch (error) {
//     console.error('Error deleting event:', error);
//     res.status(500).json({ error: 'Error deleting event' });
//   }
// };

// module.exports = {
//   addEvent,
//   getEvents,
//   getEvent,
//   updateTheEvent,
//   deleteTheEvent
// };



// controllers/calendarController.js
const mongoose = require('mongoose');
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../services/calendar.service');
const LinkedList = require('../utils/LinkedList');
const Timer = require('../utils/Timer');

const eventsLinkedList = new LinkedList();
let isLinkedListInitialized = false;
let eventTimer = null;

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

      // Start the event timer
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
    const { title, description, time, eventType, space_id } = req.body;

    if (!title || !time || !eventType || !space_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = await createEvent({
      title,
      description,
      time,
      user: req.user._id,
      eventType,
      space_id
    });

    // Add the event to the linked list
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

// Function to start the event timer
const startEventTimer = () => {
  // Get the time of the first event in the linked list
  const nextEventTime = eventsLinkedList.head ? eventsLinkedList.head.data.time : null;

  if (nextEventTime) {
    console.log('Next event time:', nextEventTime);
    eventTimer = new Timer(async () => {
      // Get the first event from the linked list
      const eventNode = eventsLinkedList.head;

      if (!eventNode) {
        console.log('No events in the linked list');
        return;
      }

      // Send the event data to another service
      try {
        await sendEventData(eventNode.data); // Replace sendEventData with your actual function to send data to another service
      } catch (error) {
        console.error('Error sending event data:', error);
        return;
      }

      // Remove the event node from the linked list
      eventsLinkedList.remove(eventNode.id);
      console.log('Event data sent and node removed from the linked list');

      // Restart the timer for the next event
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
