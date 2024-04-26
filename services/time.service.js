const { SENSORS } = require("../consts/common.consts");
const { UNDISCRETIZE_SENSORS_MAP, getSeasonNumberByMonth } = require("../utils/utils");

function getCurrentSeasonAndHour() {
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();
  const season = UNDISCRETIZE_SENSORS_MAP[SENSORS.SEASON][getSeasonNumberByMonth(month)];

  return { season, hour };
}

module.exports = {
  getCurrentSeasonAndHour
}