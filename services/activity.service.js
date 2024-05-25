const Activity = require('../models/Activity');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const getCurrentHour = () => new Date().getHours();

const getAllActivities = async (userId) => {
  try {
    const activities = await Activity.find({ user: userId }).populate('Room');
    return activities;
  } catch (error) {
    console.error('Error fetching all activities:', error);
    throw new Error('Error fetching all activities');
  }
};

const getCurrentActivity = async (userId) => {
  try {
    const hour = getCurrentHour();
    const activity = await Activity.findOne({
      user: userId,
      startTime: { $lte: hour },
      endTime: { $gt: hour }
    }).populate('Rooms');
    
    return activity;
  } catch (error) {
    console.error('Error fetching current activity:', error);
    throw new Error('Error fetching current activity');
  }
};

const getRoomById = async (roomId) => {
  try {
    const room = await Room.findById(roomId);
    return room;
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    throw new Error('Error fetching room');
  }
};

const createActivity = async ({ name, startTime, endTime, user, room }) => {
  try {
    const activity = new Activity({ name, startTime, endTime, user, room });
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw new Error('Error creating activity');
  }
};

module.exports = {
  getAllActivities,
  getCurrentActivity,
  getRoomById,
  createActivity
};
