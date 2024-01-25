const SensorValue = require("../models/SensorValue");
const _ = require("lodash");
const { SENSORS } = require("../consts/common.consts");

const getLatestSensorValues = async () => {
  return _.reduce(
    Object.values(SENSORS),
    async (accPromise, curr) => {
      acc = await accPromise;
      const value = await SensorValue.findOne({ sensor_type: curr })
        .sort({ timestamp: -1 })
        .exec();
      return {
        ...acc,
        [curr]: _.get(value, "value", null),
      };
    },
    {}
  );
};


const removeAllSensorValues = async () => {
  try {
    const result = await SensorValue.deleteMany({});
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getLatestSensorValues,
  removeAllSensorValues
};
