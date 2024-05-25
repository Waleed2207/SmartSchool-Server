// const activityService = require('../services/activity.service');
// const mongoose = require('mongoose');
// const Activity = require('../models/Activity'); // Ensure the path is correct
// const Room = require('../models/Room'); // Import the Room model

// const getAllActivities = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const activities = await Activity.find({ user: userId }).populate('room');
//     res.json(activities);
//   } catch (error) {
//     console.error('Error fetching all activities:', error);
//     res.status(500).json({ error: 'Error fetching all activities' });
//   }
// };


// const getCurrentActivity = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const currentActivity = await Activity.findOne({
//       user: userId,
//       startTime: { $lte: new Date().getHours() },
//       endTime: { $gt: new Date().getHours() }
//     }).populate('room');
//     res.json(currentActivity);
//   } catch (error) {
//     console.error('Error fetching current activity:', error);
//     res.status(500).json({ error: 'Error fetching current activity' });
//   }
// };
// const addActivity = async (req, res) => {
//   try {
//     const { name, startTime, endTime, room } = req.body;

//     // Log the received data for debugging
//     console.log('Received data:', req.body);

//     // Validate request body
//     if (!name || !startTime || !endTime || !room) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Validate startTime and endTime
//     if (typeof startTime !== 'number' || typeof endTime !== 'number') {
//       return res.status(400).json({ error: 'Invalid time format' });
//     }

//     // Room ID format validation (relaxed to accept custom format)
//     if (!/^[0-9a-fA-F-]{13,24}$/.test(room)) {
//       return res.status(400).json({ error: 'Invalid room ID' });
//     }

//     // Create a new activity with validated room ID
//     const activity = new Activity({
//       name,
//       startTime,
//       endTime,
//       user: req.user._id,
//       room: room
//     });

//     // Save the activity to the database
//     await activity.save();

//     // Respond with the newly created activity
//     res.status(201).json(activity);
//   } catch (error) {
//     console.error('Error adding new activity:', error);
//     res.status(500).json({ error: 'Failed to add activity' });
//   }
// };




// module.exports = {
//   getAllActivities,
//   getCurrentActivity,
//   addActivity
// };








const mongoose = require('mongoose');
const Activity = require('../models/Activity'); // Import the Activity model
const Room = require('../models/Room'); // Import the Room model

const getAllActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await Activity.find({ user: userId }).populate('room');
    res.json(activities);
  } catch (error) {
    console.error('Error fetching all activities:', error);
    res.status(500).json({ error: 'Error fetching all activities' });
  }
};

const getCurrentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentActivity = await Activity.findOne({
      user: userId,
      startTime: { $lte: new Date().getHours() },
      endTime: { $gt: new Date().getHours() }
    }).populate('room');
    res.json(currentActivity);
  } catch (error) {
    console.error('Error fetching current activity:', error);
    res.status(500).json({ error: 'Error fetching current activity' });
  }
};

// const addActivity = async (req, res) => {
//   try {
//     const { name, startTime, endTime, room } = req.body;

//     // Log the received data for debugging
//     console.log('Received data:', req.body);

//     // Validate request body
//     if (!name || startTime == null || endTime == null || !room) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Validate startTime and endTime
//     if (typeof startTime !== 'number' || typeof endTime !== 'number') {
//       return res.status(400).json({ error: 'Invalid time format' });
//     }

//     // Room ID format validation (relaxed to accept custom format)
//     if (!/^[0-9a-fA-F-]{13,24}$/.test(room)) {
//       return res.status(400).json({ error: 'Invalid room ID' });
//     }

//     // Create a new activity with validated room ID
//     const activity = new Activity({
//       name,
//       startTime,
//       endTime,
//       user: req.user._id,
//       room: room
//     });

//     // Save the activity to the database
//     await activity.save();

//     // Respond with the newly created activity
//     res.status(201).json(activity);
//   } catch (error) {
//     console.error('Error adding new activity:', error);
//     res.status(500).json({ error: 'Failed to add activity' });
//   }
// };



const addActivity = async (req, res) => {
  try {
    const { name, startTime, endTime, room } = req.body;

    // Log the received data for debugging
    console.log('Received data:', req.body);

    // Validate request body
    if (!name || startTime == null || endTime == null || !room) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate startTime and endTime
    if (typeof startTime !== 'number' || typeof endTime !== 'number') {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    // Room ID format validation (relaxed to accept custom format)
    if (!/^[0-9a-fA-F-]{13,24}$/.test(room)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }

    // Create a new activity with validated room ID
    const activity = new Activity({
      name,
      startTime,
      endTime,
      user: req.user._id,
      room: room
    });

    // Save the activity to the database
    await activity.save();

    // Respond with the newly created activity
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error adding new activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

module.exports = {
  getAllActivities,
  getCurrentActivity,
  addActivity
};
