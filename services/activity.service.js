// const Activity = require('../models/Activity');
// const mongoose = require('mongoose');

// const createActivity = async ({ name, startTime, endTime, user }) => {
//   try {
//     const activity = new Activity({
//       name,
//       startTime: new Date(startTime),
//       endTime: new Date(endTime),
//       user: mongoose.Types.ObjectId(user)
//     });

//     await activity.save();
//     return activity;
//   } catch (error) {
//     console.error('Error creating activity:', error);
//     throw new Error('Error creating activity');
//   }
// };

// const getAllActivities = async (userId) => {
//   try {
//     const activities = await Activity.find({ user: mongoose.Types.ObjectId(userId) });
//     return activities;
//   } catch (error) {
//     console.error('Error fetching all activities:', error);
//     throw new Error('Error fetching all activities');
//   }
// };

// const getCurrentActivity = async (userId) => {
//   try {
//     const currentTime = new Date();
//     const activity = await Activity.findOne({
//       user: mongoose.Types.ObjectId(userId),
//       startTime: { $lte: currentTime },
//       endTime: { $gt: currentTime }
//     });
//     return activity;
//   } catch (error) {
//     console.error('Error fetching current activity:', error);
//     throw new Error('Error fetching current activity');
//   }
// };

// module.exports = {
//   createActivity,
//   getAllActivities,
//   getCurrentActivity
// };




const Activity = require('../models/Activity');
const mongoose = require('mongoose');

const createActivity = async ({ name, startTime, endTime, user }) => {
  try {
    console.log('Creating activity with data:', { name, startTime, endTime, user });

    const activity = new Activity({
      name,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      user: new mongoose.Types.ObjectId(user)  // Correct usage with 'new'
    });

    console.log('Activity object:', activity);

    await activity.save();

    console.log('Activity saved:', activity);

    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw new Error('Error creating activity');
  }
};
const getCurrentUserActivity = async (userId) => {
  try {
    const currentTime = new Date();
    const activity = await Activity.findOne({
      user: mongoose.Types.ObjectId(userId),
      startTime: { $lte: currentTime },
      endTime: { $gt: currentTime }
    });
    return activity;
  } catch (error) {
    console.error('Error fetching current activity:', error);
    throw new Error('Error fetching current activity');
  }
};
const getAllUserActivities = async (userId) => {
  try {
    const activities = await Activity.find({ user: mongoose.Types.ObjectId(userId) });
    return activities;
  } catch (error) {
    console.error('Error fetching all activities:', error);
    throw new Error('Error fetching all activities');
  }
};
module.exports = {
  createActivity,
  getCurrentUserActivity,
  getAllUserActivities
};
