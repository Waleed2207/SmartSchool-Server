const Activity = require('../models/Activity');
const mongoose = require('mongoose');

const createActivity = async ({ name, user }) => {
  try {
    console.log('Creating or updating activity with data:', { name, user });

    const userId = new mongoose.Types.ObjectId(user);

    // Check if an activity already exists for the user
    let activity = await Activity.findOne({ user: userId });

    if (activity) {
      // Update the existing activity
      activity.name = name;
      await activity.save();
      console.log('Activity updated:', activity);
    } else {
      // Create a new activity
      activity = new Activity({
        name,
        user: userId
      });
      await activity.save();
      console.log('Activity created:', activity);
    }

    return activity;
  } catch (error) {
    console.error('Error creating or updating activity:', error);
    throw new Error('Error creating or updating activity');
  }
};

const getCurrentUserActivity = async (userId) => {
  try {
    const activity = await Activity.findOne({
      user: mongoose.Types.ObjectId(userId),
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
