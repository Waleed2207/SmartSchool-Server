// const { createActivity, getCurrentUserActivity, getAllUserActivities , updateActivityById, getActivityById} = require('../services/activity.service');

// const addActivity = async (req, res) => {
//   try {
//     const { name} = req.body;

//     if (!name ) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ error: 'Unauthorized: User ID missing' });
//     }

//     const activity = await createActivity({
//       name,
    
//       user: req.user._id
//     });

//     res.status(201).json(activity);
//   } catch (error) {
//     console.error('Error adding new activity:', error);
//     res.status(500).json({ error: 'Failed to add activity' });
//   }
// };
// const updateActivity = async (req, res) => {
//   try {
//     const { activityId, name } = req.body;

//     if (!activityId || !name) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ error: 'Unauthorized: User ID missing' });
//     }

//     const updateData = { name };
//     const updatedActivity = await updateActivityById(activityId, updateData);

//     res.status(200).json(updatedActivity);
//   } catch (error) {
//     console.error('Error updating activity:', error);
//     res.status(500).json({ error: 'Failed to update activity' });
//   }
// };
// const getTheActivityById = async (req, res) => {
//   try {
//     const { activityId } = req.params;

//     if (!activityId) {
//       return res.status(400).json({ error: 'Missing required activityId parameter' });
//     }

//     const activity = await getActivityById(activityId);
//     if (!activity) {
//       return res.status(404).json({ error: 'Activity not found' });
//     }

//     res.status(200).json(activity);
//   } catch (error) {
//     console.error('Error fetching activity by ID:', error);
//     res.status(500).json({ error: 'Failed to fetch activity by ID' });
//   }
// };
// const getAllActivities = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const activities = await getAllUserActivities(userId);

//     res.json(activities);
//   } catch (error) {
//     console.error('Error fetching all activities:', error);
//     res.status(500).json({ error: 'Error fetching all activities' });
//   }
// };

// const getCurrentActivity = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const currentActivity = await getCurrentUserActivity(userId);

//     if (!currentActivity) {
//       return res.status(404).json({ error: 'No current activity found' });
//     }

//     res.json(currentActivity);
//   } catch (error) {
//     console.error('Error fetching current activity:', error);
//     res.status(500).json({ error: 'Error fetching current activity' });
//   }
// };

// module.exports = {
//   addActivity,
//   getAllActivities,
//   getCurrentActivity,
//   updateActivity,
//   getTheActivityById
// };










const {
  getTheAllActivities,
  getTheCurrentActivity,
  createActivity,
  updateActivityById,
  getActivitiesByRuleId,
  getTheActivityById
} = require('../services/activity.service');

const getAllActivities = async (req, res) => {
  try {
    const activities = await getAllActivities(req.user._id);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching all activities:', error);
    res.status(500).json({ error: 'Error fetching all activities' });
  }
};

const getCurrentActivity = async (req, res) => {
  try {
    const currentActivity = await getCurrentActivity(req.user._id);
    res.json(currentActivity);
  } catch (error) {
    console.error('Error fetching current activity:', error);
    res.status(500).json({ error: 'Error fetching current activity' });
  }
};

const addActivity = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
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

const updateActivity = async (req, res) => {
  try {
    const { activityId, name } = req.body;

    if (!activityId || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const updateData = { name };
    const updatedActivity = await updateActivityById(activityId, updateData);

    res.status(200).json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

const getActivitiesByRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    if (!ruleId) {
      return res.status(400).json({ error: 'Missing required ruleId parameter' });
    }

    const activities = await getActivitiesByRuleId(ruleId);
    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities by rule:', error);
    res.status(500).json({ error: 'Failed to fetch activities by rule' });
  }
};

const getActivityById = async (req, res) => {
  const { activityId } = req.params;
  try {
    const activity = await getTheActivityById(activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(200).json(activity);
  } catch (error) {
    console.error('Error fetching activity by ID:', error);
    res.status(500).json({ error: 'Failed to fetch activity by ID' });
  }
};

module.exports = {
  getAllActivities,
  getCurrentActivity,
  addActivity,
  updateActivity,
  getActivitiesByRule,
  getActivityById
};
