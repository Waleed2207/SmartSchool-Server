const Activity = require('../models/Activity');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

// Function to get the current UTC time
const getCurrentTime = () => dayjs().utc().toDate();

// Function to fetch all activities for a user
const getAllActivities = async (userId) => {
  try {
    const activities = await Activity.find({ user: mongoose.Types.ObjectId(userId) }).populate('room');
    return activities;
  } catch (error) {
    console.error('Error fetching all activities:', error);
    throw new Error('Error fetching all activities');
  }
};

// Function to fetch the current activity for a user
const getCurrentActivity = async (userId) => {
  try {
    const currentTime = getCurrentTime();
    console.log(`Fetching current activity for user: ${userId} at time: ${currentTime.toISOString()}`);

    const activity = await Activity.findOne({
      user: mongoose.Types.ObjectId(userId),
      startTime: { $lte: currentTime },
      endTime: { $gt: currentTime }
    }).populate('room');

    return activity;
  } catch (error) {
    console.error('Error fetching current activity:', error);
    throw new Error('Error fetching current activity');
  }
};

// Function to fetch a room by its ID
const getRoomById = async (roomId) => {
  try {
    const room = await Room.findById(mongoose.Types.ObjectId(roomId));
    return room;
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    throw new Error('Error fetching room');
  }
};

// Function to create a new activity
const createActivity = async ({ name, startTime, endTime, user, room }) => {
  try {
    const activity = new Activity({
      name,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      user: mongoose.Types.ObjectId(user),
      room: room
    });
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
