const axios = require("axios");
const { getLatestSensorValues } = require("../services/sensorValues.service");
const { getCurrentSeasonAndHour } = require("../services/time.service");
require("dotenv").config();
const { getDevices } = require("../services/devices.service.js");
const { DateTime } = require("luxon");
const { DISCRETIZE_SENSORS_MAP } = require("./utils");
const { SENSORS, ML_DEVICES } = require("../consts/common.consts");


async function callBayesianScript(requestData) {

  const evidence = Object.entries(DISCRETIZE_SENSORS_MAP)
  .reduce((acc, curr) => {
    return {
      ...acc,
      [curr[0]]: curr[1](requestData[curr[0]]) 
    }   
  }, {})

  try {
    const response = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/recommend_device`,
      {
        devices: requestData.devices,
        evidence: evidence,
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Python API error: ${error}`);
    throw error;
  }
}

async function runBayesianScript() {
  console.log("Baysian Script is called!");
  try {

    const devices = Object.values(ML_DEVICES);
    const latestSensorValues = await getLatestSensorValues();
    const { season, hour } = getCurrentSeasonAndHour();

    
    const requestData = {
      devices,
      ...latestSensorValues,
      [SENSORS.SEASON]: season,
      [SENSORS.HOUR]: hour
    }
    

    const recommendation = await callBayesianScript(requestData);
    console.log(recommendation); // Do something with the recommendation
  } catch (error) {
    console.error(`Error getting recommendation: ${error}`);
  }
}

async function addingDataToCsv() {
  console.log("Adding data to csv file");
  try {
    // real values
    const devices = await getDevices();
    const ac_status = devices[1].state;
    const heater_switch = devices[2].state;
    const laundry_machine = devices[0].state;
    const pump = devices[5].state;
    const { season } = getCurrentSeasonAndHour();
    const timestamp = getRoundedDate();
    const { temperature, humidity, distance, soil } =
      await getLatestSensorValues();

    // random values
    const lights = getRandomOnOffValue();
    const fan = getRandomOnOffValue();
    const ac_temperature = getRandomValue(30, 16, 1);
    const ac_mode = ac_temperature > 25 ? "heat" : "cool";
    const ac_energy = getRandomValue(5, 100, 1);
    const ac_duration = getRandomValue(50, 200, 1);
    const heater_energy = getRandomValue(50, 200, 2);
    const heater_duration = getRandomValue(30, 100, 1);
    const lights_energy = getRandomValue(30, 100, 2);
    const lights_duration = getRandomValue(30, 300, 1);
    const laundry_energy = getRandomValue(30, 100, 1);
    const laundry_duration = getRandomValue(30, 100, 1);
    const pump_duration = 0.1;
    const requestData = {
      timestamp,
      [ML_DEVICES.LIGHTS]: lights,
      [ML_DEVICES.FAN]: fan,
      [ML_DEVICES.AC_STATUS]: ac_status,
      ac_temperature,
      ac_mode,
      [ML_DEVICES.HEATER_SWITCH]:heater_switch,
      [ML_DEVICES.LAUNDRY_MATCHINE]:laundry_machine,
      [ML_DEVICES.PUMP]:pump,
      [SENSORS.TEMPERATURE]: extractValueFromString(temperature),
      [SENSORS.HUMIDITY]: extractValueFromString(humidity),
      [SENSORS.DISTANCE]: extractValueFromString(distance),
      [SENSORS.SEASON]: season,
      [SENSORS.SOIL]:soil,
      ac_energy,
      ac_duration,
      heater_energy,
      heater_duration,
      lights_energy,
      lights_duration,
      laundry_energy,
      laundry_duration,
      pump_duration,
    };
    try {
      const response = await axios.post("http://127.0.0.1:5000/update_data", {
        data: requestData,
      });
      console.log("Added data to csv file ended succussfully");
      return response.data;
    } catch (error) {
      console.error(`Python API error: ${error}`);
      throw error;
    }
  } catch (error) {
    console.error(`Error Adding data to csv: ${error}`);
  }
}

function getRoundedDate() {
  let now = DateTime.local().setZone("Asia/Jerusalem");
  let desiredHours = [8, 12, 14, 18, 20];
  let currentHour = now.hour;

  // Calculate the index of the closest desired hour
  let closestIndex = desiredHours.reduce((prev, curr, index) => {
    let prevDiff = Math.abs(prev - currentHour);
    let currDiff = Math.abs(curr - currentHour);
    return currDiff < prevDiff ? index : prev;
  }, 0);

  // Round to the previous closest desired hour
  let closestHour = desiredHours[closestIndex];
  if (closestHour > currentHour) {
    closestIndex =
      closestIndex > 0 ? closestIndex - 1 : desiredHours.length - 1;
    closestHour = desiredHours[closestIndex];
  }

  // Format the date as a string in the desired format
  let roundedDate = now.set({
    hour: closestHour,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  let formattedDate = roundedDate.toFormat("yyyy-MM-dd HH:mm:ss");

  return formattedDate;
}

function extractValueFromString(str) {
  const regex = /\d+\.\d+/;
  const match = str.match(regex);
  if (match) {
    return match[0];
  } else {
    return null;
  }
}

function getRandomOnOffValue() {
  return ["on", "off"][Math.floor(Math.random() * 2)];
}

function getRandomValue(maxVal, minVal, numberAfterTheDot) {
  let randomFloat = Math.random() * (maxVal - minVal) + minVal;
  return Number(randomFloat.toFixed(numberAfterTheDot));
}

module.exports = {
  callBayesianScript,
  runBayesianScript,
  addingDataToCsv,
};
