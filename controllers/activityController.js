const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const getAllActivitiesByRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.roomId;
    const activities = await Activity.find({ user: userId, room: roomId }).populate('room');
    res.json(activities);
  } catch (error) {
    console.error('Error fetching all activities:', error);
    res.status(500).json({ error: 'Error fetching all activities' });
  }
};

const getCurrentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.roomId;
    const currentTime = dayjs().utc().toDate();

    console.log(`Fetching current activity for user: ${userId}, room: ${roomId} at time: ${currentTime.toISOString()}`);

    const currentActivity = await Activity.findOne({
      user: new mongoose.Types.ObjectId(userId),
      room: new mongoose.Types.ObjectId(roomId),
      startTime: { $lte: currentTime },
      endTime: { $gt: currentTime }
    }).populate('room');

    console.log("Query Result: ", currentActivity);

    if (!currentActivity) {
      console.log("No current activity found");
      return res.status(404).json({ error: 'No current activity found' });
    }

    console.log("Current activity found:", currentActivity);
    res.json(currentActivity);
  } catch (error) {
    console.error('Error fetching current activity:', error);
    res.status(500).json({ error: 'Error fetching current activity' });
  }
};

const addActivity = async (req, res) => {
  try {
    const { name, startTime, endTime, room } = req.body;

    console.log('Received data:', req.body);

    if (!name || !startTime || !endTime || !room) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    const activity = new Activity({
      name,
      startTime: startTimeDate,
      endTime: endTimeDate,
      user: req.user._id,
      room: new mongoose.Types.ObjectId(room)
    });

    await activity.save();

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error adding new activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

module.exports = {
  getAllActivitiesByRoom,
  getCurrentActivity,
  addActivity
};
