

 const OPERATORS_MAP_FORMATTER = {
    above: ">",
    below: "<",
    ["is not"]: "!=",
    is: "==",
  };

   const SEASONS_MAP_FORMATTER = {
    winter: 1,
    spring: 2,
    summer: 3,
    fall: 4
  }

   const HOURS_MAP_FORMATTER = {
    morning: 1,
    afternoon: 2,
    evening: 3
  }

  const SENSOR_DEVICE_RELATION_MAP = {
    temperature: 'ac'
  }

  module.exports = {
    OPERATORS_MAP_FORMATTER,
    SEASONS_MAP_FORMATTER, 
    HOURS_MAP_FORMATTER,
    SENSOR_DEVICE_RELATION_MAP
  }