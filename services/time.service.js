const { SENSORS, SEASONS } = require("../consts/common.consts");
const { UNDISCRETIZE_SENSORS_MAP, getSeasonNumberByMonth } = require("../utils/utils");
const { ACTIVITY } = require("../consts/common.consts");

function getCurrentSeasonAndHour() {
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();
  const season = UNDISCRETIZE_SENSORS_MAP[SENSORS.SEASON][getSeasonNumberByMonth(month)];

  return { season, hour };
}
function getCurrentActivity() {
  const { hour } = getCurrentSeasonAndHour(); // Retrieve the current hour from the existing function

  let currentActivity;

  if (hour >= 6 && hour < 9) {
    currentActivity = ACTIVITY.STUDYING; // Morning hours might be ideal for studying
  } else if (hour >= 9 && hour < 12) {
    currentActivity = ACTIVITY.COOKING; // Late morning might be a good time to prepare meals
  } else if (hour >= 12 && hour < 14) {
    currentActivity = ACTIVITY.EATING; // Noon time is typically for lunch
  } else if (hour >= 14 && hour < 17) {
    currentActivity = ACTIVITY.PLAYING; // Afternoon can be a time for activities or sports
  } else if (hour >= 17 && hour < 20) {
    currentActivity = ACTIVITY.WATCHING_TV; // Early evening might be time to relax and watch TV
  } else if (hour >= 20 || hour < 6) {
    currentActivity = ACTIVITY.SLEEPING; // Late night hours are typically for sleeping
  }

  return currentActivity;
}

function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns month from 0 (January) to 11 (December), so add 1 for clarity

  if (month >= 3 && month <= 5) {
    return SEASONS.SPRING;
  } else if (month >= 6 && month <= 8) {
    return SEASONS.SUMMER;
  } else if (month >= 9 && month <= 11) {
    return SEASONS.FALL;
  } else {
    return SEASONS.WINTER; // Covers months 12, 1, 2
  }
}
module.exports = {
  getCurrentSeasonAndHour,
  getCurrentActivity,
  getCurrentSeason,
}