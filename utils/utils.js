const { SENSORS, SEASONS, DAY_TIME } = require("../consts/common.consts");

const discretizeTemperature = (temperature) => {
  if (temperature <= 15) {
    return 1;
  } else if (temperature > 15 && temperature <= 20) {
    return 2;
  } else if (temperature > 20 && temperature <= 25) {
    return 3;
  } else if (temperature > 25 && temperature <= 32) {
    return 4;
  }
};


function discretizeHumidity(humidity) {
  if (humidity <= 30) return 1;
  if (humidity <= 60) return 2;
  if (humidity <= 90) return 3;
  return 4;
}

function discretizeDistance(distance) {
  if (distance <= 0.01) return 1;
  if (distance <= 20) return 2;
  return 3;
}

function discretizeHour(hour) {
  if (hour <= 12) return 1;
  if (hour <= 18) return 2;
  return 3;
}

function discretizSoil(soil) {
  if (soil < 2200) return 1;
  return 2;
}

function convertSeasonToNumber(season) {
  const seasonMapping = {
    [SEASONS.WINTER]: 1,
    [SEASONS.SPRING]: 2,
    [SEASONS.SUMMER]: 3,
    [SEASONS.FALL]: 4
  };
  return seasonMapping[season];
}


const checkIfHour = (value) => {
  if (value === DAY_TIME.MORNING) return 1;
  if (value === DAY_TIME.AFTERNOON) return 2;
  if (value === DAY_TIME.EVENING) return 3;
  else return value;
}


const createRegexPattern = (words) => {
  let regexPattern = '^(' + words.join('|') + ')$';
  const regex = new RegExp(regexPattern, 'i');
return regex;
}



const replaceWords = (rule, map) => {
  Object.entries(map).forEach((item) => {
    const regex = new RegExp(item[0], "g");
    rule = rule.replace(regex, item[1]);
  });
  return rule;
};


const DISCRETIZE_SENSORS_MAP = {
  [SENSORS.TEMPERATURE]: discretizeTemperature,
  [SENSORS.HUMIDITY]: discretizeHumidity,
  [SENSORS.HOUR]: discretizeHour,
  [SENSORS.SOIL]: discretizSoil,
  [SENSORS.DISTANCE]: discretizeDistance,
  [SENSORS.SEASON]: convertSeasonToNumber,
}


const UNDISCRETIZE_SENSORS_MAP = {
  [SENSORS.HOUR]: { 1: "morning", 2: "afternoon", 3: "evening" },
  [SENSORS.TEMPERATURE]: { 1: 15, 2: 20, 3: 25, 4: 27 },
  [SENSORS.HUMIDITY]: { 1: 30, 2: 60, 3: 90, 4: 100 },
  [SENSORS.DISTANCE]: { 1: 0.01, 2: 20, 3: 100 },
  [SENSORS.SEASON]: { 1: "winter", 2: "spring", 3: "summer", 4: "fall" },
};

const getSeasonNumberByMonth = (currentMonth) =>{
  if (currentMonth >= 3 && currentMonth <= 5) {
    return 2; // Spring
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    return 3; // Summer
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    return 4; // Fall
  } else {
    return 1; // Winter
  }

  
}


module.exports = {
  discretizeTemperature,
  discretizeDistance,
  discretizeHour,
  discretizeHour,
  discretizeHumidity,
  convertSeasonToNumber,
  checkIfHour,
  createRegexPattern,
  discretizSoil,
  replaceWords,
  DISCRETIZE_SENSORS_MAP,
  UNDISCRETIZE_SENSORS_MAP,
  getSeasonNumberByMonth,
  
}