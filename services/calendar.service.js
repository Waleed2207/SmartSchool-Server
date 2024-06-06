const CalendarEvent = require('../models/CalendarEvent');
const mongoose = require('mongoose');

const createEvent = async ({ title, description, start, end, user, eventType, space_id }) => {
  try {
    console.log('Creating event with data:', { title, description, start, end, user, eventType, space_id });

    const event = new CalendarEvent({
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      user: new mongoose.Types.ObjectId(user),
      eventType,
      space_id // Treat space_id as a normal string
    });

    console.log('Event object:', event);

    await event.save();

    console.log('Event saved:', event);

    return event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Error creating event');
  }
};

const getAllEvents = async (userId, spaceId) => {
  try {
    const events = await CalendarEvent.find({
      user: new mongoose.Types.ObjectId(userId),
      space_id: spaceId // Treat spaceId as a normal string
    });
    return events;
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw new Error('Error fetching all events');
  }
};

const getEventById = async (eventId, userId) => {
  try {
    const event = await CalendarEvent.findOne({ _id: new mongoose.Types.ObjectId(eventId), user: new mongoose.Types.ObjectId(userId) });
    return event;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw new Error('Error fetching event');
  }
};

const updateEvent = async (eventId, userId, updates) => {
  try {
    if (updates.space_id) {
      // Ensure space_id is treated as a string
      updates.space_id = updates.space_id;
    }
    if (updates.start) {
      updates.start = new Date(updates.start);
    }
    if (updates.end) {
      updates.end = new Date(updates.end);
    }
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(eventId), user: new mongoose.Types.ObjectId(userId) },
      updates,
      { new: true }
    );
    return event;
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Error updating event');
  }
};

const deleteEvent = async (eventId, userId) => {
  try {
    await CalendarEvent.findOneAndDelete({ _id: new mongoose.Types.ObjectId(eventId), user: new mongoose.Types.ObjectId(userId) });
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Error deleting event');
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
