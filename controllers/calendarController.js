const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../services/calendar.service');

const addEvent = async (req, res) => {
    try {
      const { title, description, start, end, eventType, space_id } = req.body;
  
      if (!title || !start || !end || !eventType || !space_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const startTime = new Date(start);
      const endTime = new Date(end);
  
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ error: 'Invalid time format' });
      }
  
      if (endTime <= startTime) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }
  
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Unauthorized: User ID missing' });
      }
  
      const event = await createEvent({
        title,
        description,
        start: startTime,
        end: endTime,
        user: req.user._id,
        eventType,
        space_id
      });
  
      res.status(201).json(event);
    } catch (error) {
      console.error('Error adding event:', error);
      res.status(500).json({ error: 'Failed to add event' });
    }
  };
  

  const getEvents = async (req, res) => {
    try {
      const { spaceId } = req.params; // Or req.body if it's sent in the body
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
    if (updates.start) {
      updates.start = new Date(updates.start);
      if (isNaN(updates.start.getTime())) {
        return res.status(400).json({ error: 'Invalid start time format' });
      }
    }
    if (updates.end) {
      updates.end = new Date(updates.end);
      if (isNaN(updates.end.getTime())) {
        return res.status(400).json({ error: 'Invalid end time format' });
      }
    }
    if (updates.start && updates.end && updates.end <= updates.start) {
      return res.status(400).json({ error: 'End time must be after start time' });
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
    await deleteEvent(req.params.eventId, req.user._id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
};

module.exports = {
  addEvent,
  getEvents,
  getEvent,
  updateTheEvent,
  deleteTheEvent
};
