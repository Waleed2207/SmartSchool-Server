const { createActivity, getCurrentUserActivity, getAllUserActivities } = require('../services/activity.service');

const addActivity = async (req, res) => {
  try {
    const { name, startTime, endTime } = req.body;

    if (!name || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    if (endTimeDate <= startTimeDate) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const activity = await createActivity({
      name,
      startTime: startTimeDate,
      endTime: endTimeDate,
      user: req.user._id
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error adding new activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

const getAllActivities = async (req, res) => {
  try {
    const userId = req.user._id;

    const activities = await getAllUserActivities(userId);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching all activities:', error);
    res.status(500).json({ error: 'Error fetching all activities' });
  }
};

const getCurrentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentActivity = await getCurrentUserActivity(userId);

    if (!currentActivity) {
      return res.status(404).json({ error: 'No current activity found' });
    }

    res.json(currentActivity);
  } catch (error) {
    console.error('Error fetching current activity:', error);
    res.status(500).json({ error: 'Error fetching current activity' });
  }
};

module.exports = {
  addActivity,
  getAllActivities,
  getCurrentActivity
};
