const { createActivity, getCurrentUserActivity, getAllUserActivities } = require('../services/activity.service');

const addActivity = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }
    const activity = await createActivity({
      name,
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
