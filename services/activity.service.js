// // const Activity = require('../models/Activity');
// // const mongoose = require('mongoose');

// // const createActivity = async ({ name, startTime, endTime, user }) => {
// //   try {
// //     const activity = new Activity({
// //       name,
// //       startTime: new Date(startTime),
// //       endTime: new Date(endTime),
// //       user: mongoose.Types.ObjectId(user)
// //     });

// //     await activity.save();
// //     return activity;
// //   } catch (error) {
// //     console.error('Error creating activity:', error);
// //     throw new Error('Error creating activity');
// //   }
// // };

// // const getAllActivities = async (userId) => {
// //   try {
// //     const activities = await Activity.find({ user: mongoose.Types.ObjectId(userId) });
// //     return activities;
// //   } catch (error) {
// //     console.error('Error fetching all activities:', error);
// //     throw new Error('Error fetching all activities');
// //   }
// // };

// // const getCurrentActivity = async (userId) => {
// //   try {
// //     const currentTime = new Date();
// //     const activity = await Activity.findOne({
// //       user: mongoose.Types.ObjectId(userId),
// //       startTime: { $lte: currentTime },
// //       endTime: { $gt: currentTime }
// //     });
// //     return activity;
// //   } catch (error) {
// //     console.error('Error fetching current activity:', error);
// //     throw new Error('Error fetching current activity');
// //   }
// // };

// // module.exports = {
// //   createActivity,
// //   getAllActivities,
// //   getCurrentActivity
// // };




// const Activity = require('../models/Activity');
// const mongoose = require('mongoose');

// const createActivity = async ({ name, user }) => {
//   try {
//     console.log('Creating activity with data:', { name, user });

//     const activity = new Activity({
//       name,
//       user: new mongoose.Types.ObjectId(user)  // Correct usage with 'new'
//     });

//     console.log('Activity object:', activity);

//     await activity.save();

//     console.log('Activity saved:', activity);

//     return activity;
//   } catch (error) {
//     console.error('Error creating activity:', error);
//     throw new Error('Error creating activity');
//   }
// };
// const getCurrentUserActivity = async (userId) => {
//   try {
 
//     const activity = await Activity.findOne({
//       user: mongoose.Types.ObjectId(userId),

//     });
//     return activity;
//   } catch (error) {
//     console.error('Error fetching current activity:', error);
//     throw new Error('Error fetching current activity');
//   }
// };
// const updateActivityById = async (activityId, updateData) => {
//   try {
//     const updatedActivity = await Activity.findByIdAndUpdate(
//       mongoose.Types.ObjectId(activityId),
//       updateData,
//       { new: true }  // This option returns the modified document rather than the original.
//     );
//     return updatedActivity;
//   } catch (error) {
//     console.error('Error updating activity:', error);
//     throw new Error('Error updating activity');
//   }
// };

// const getAllUserActivities = async (userId) => {
//   try {
//     const activities = await Activity.find({ user: mongoose.Types.ObjectId(userId) });
//     return activities;
//   } catch (error) {
//     console.error('Error fetching all activities:', error);
//     throw new Error('Error fetching all activities');
//   }
// };
// const getActivityById = async (activityId) => {
//   try {
//     const activity = await Activity.findById(new mongoose.Types.ObjectId(activityId));
//     return activity;
//   } catch (error) {
//     console.error('Error fetching activity by ID:', error);a
//     throw new Error('Error fetching activity by ID');
//   }
// };
// module.exports = {
//   createActivity,
//   getCurrentUserActivity,
//   getAllUserActivities,
//   updateActivityById,
//   getActivityById
// };







const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const getCurrentTime = () => dayjs().utc().toDate();

const geThetAllActivities = async (userId) => {
  try {
    const activities = await Activity.find({ user: new mongoose.Types.ObjectId(userId) });
    return activities;
  } catch (error) {
    console.error('Error fetching all activities:', error);
    throw new Error('Error fetching all activities');
  }
};

const getTheCurrentActivity = async (userId) => {
  try {
    const currentTime = getCurrentTime();
    console.log(`Fetching current activity for user: ${userId} at time: ${currentTime.toISOString()}`);

    const activity = await Activity.findOne({
      user: new mongoose.Types.ObjectId(userId),
      startTime: { $lte: currentTime },
      endTime: { $gt: currentTime }
    });

    return activity;
  } catch (error) {
    console.error('Error fetching current activity:', error);
    throw new Error('Error fetching current activity');
  }
};

const createActivity = async ({ name, user }) => {
  try {
    const activity = new Activity({
      name,
      user: new mongoose.Types.ObjectId(user)
    });
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw new Error('Error creating activity');
  }
};

const updateActivityById = async (activityId, updateData) => {
  try {
    const updatedActivity = await Activity.findByIdAndUpdate(
      new mongoose.Types.ObjectId(activityId),
      updateData,
      { new: true }
    );
    return updatedActivity;
  } catch (error) {
    console.error('Error updating activity:', error);
    throw new Error('Error updating activity');
  }
};

const getActivitiesByRuleId = async (ruleId) => {
  try {
    const rule = await Rule.findById(new mongoose.Types.ObjectId(ruleId));
    if (!rule) {
      throw new Error('Rule not found');
    }

    const condition = rule.condition;
    const activities = await Activity.find({
      [condition.variable]: { [`$${condition.operator}`]: condition.value }
    });

    return activities;
  } catch (error) {
    console.error('Error fetching activities by rule:', error);
    throw new Error('Error fetching activities by rule');
  }
};

const getTheActivityById = async (activityId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      throw new Error('Invalid activity ID format');
    }
    const activity = await Activity.findById(activityId); // No need for new mongoose.Types.ObjectId(activityId)
    return activity;
  } catch (error) {
    console.error('Error fetching activity by ID:', error);
    throw new Error('Error fetching activity by ID');
  }
};

module.exports = {
  geThetAllActivities,
  getTheCurrentActivity,
  createActivity,
  updateActivityById,
  getActivitiesByRuleId,
  getTheActivityById
};
