const { default: axios } = require("axios");
const Device = require("../models/Device");
const { updateDeviceModeInDatabase } = require("../services/devices.service");
const { addingDataToCsv } = require("../utils/machineLearning.js");
const SensorValue = require("../models/SensorValue");
const { getSeasonNumberByMonth, discretizeHour } = require("../utils/utils");
const { SENSORS } = require("../consts/common.consts");


const test = 0;
const analyzeFunc = async (func) => {
  console.log("ANALYZE")
  try {
    const forPattern = /\b(for)\b/;
    const isWithDuration = forPattern.test(func);
    let durationString;
    let time, units, durationInMiliSeconds;
    if (isWithDuration) {
      durationString = func.split(" for ")[1];
      time = parseInt(durationString.substring(0, durationString.indexOf(" ")));
      units = durationString.split(" ")[1]; 
      if (units !== "minutes" && units !== "hours") {
        throw new Error("Units has to be minutes or hours");
      }
      durationInMiliSeconds =
        units === "minutes" ? time * 60 * 1000 : time * 60 * 60 * 1000;
    }

    let response;
    const state = func.split(" ")[1];

    if (state !== "on" && state !== "off") {
      throw new Error("Invalid state");
    }
    const boolState = state === "on";
    const numberPattern = /\d+/g;
    const matches = func.match(numberPattern);
    let degrees = null;
    if (
      matches &&
      (matches.length > 1 || (matches.length > 0 && !isWithDuration))
    ) {
      degrees = matches[0];
    }
    if (degrees) {
      // const degrees = matches[0];
      if (degrees > 30 || degrees < 16) {
        throw new Error("Degrees has to be between 16 and 30");
      }
      response = await switchAcState(boolState, parseInt(degrees));
    } else {
      response = await switchAcState(boolState);
    }
    if (isWithDuration) {
      //turn ac off after a duration
      setTimeout(async () => {
        response = await switchAcState(false);
      }, durationInMiliSeconds)
    }
    return response;
  } catch (err) {
    return { statusCode: 403, data: err.message };
  }
};

const validateDegree = (degree) => {
  if (degree > 30 || degree < 16) {
    return false;
  }
  return true;
};

const switchAcState = async (state, temperature = null) => {
  console.log("SWITCH AC")
  try {
    if (!temperature || validateDegree(temperature)) {
      // const response = await axios.post(
      //   `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,
      //   {
      //     acState: {
      //       on: state,
      //       targetTemperature: temperature,
      //     },
      //   }
      // );
      await Device.updateOne(
        { device_id: "9EimtVDZ" },
        { state: state ? "on" : "off" }
      );
      console.log("AC ON")
      console.log("-----------Adding data to csv---------------");
      // await addingDataToCsv()
      return { statusCode: 200, data: response.data.result };
    } else {
      throw new Error("Temperature has to be between 16 and 30");
    }
  } catch (err) {
    // console.log(err).message;
    return { statusCode: 403, data: err.message };
  }
};

const getAcState = async () => {
  try {
    const response = await axios.get(
      `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`
    );
    const state = response.data.result[0].acState;
    return state;
  } catch (err) {
    console.log(err + " Invalid read from Sensibo");
  }
};

const getSensiboSensors = async () => {
  try {
    const response = await axios.get(
      `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/measurements?fields=temperature,humidity&apiKey=${process.env.SENSIBO_API_KEY}`
    );
    return response;
  } catch (err) {
    console.log(err);
  }
};

const parseSensorAndWriteToMongo = async () => {
  try {
    // Fetch the current temperature and humidity values
    const response = await getSensiboSensors();
    const data = response.data.result[0];
    const { temperature, humidity } = data;

    // console.log({temperature})
    const temperatureValue = `VAR temperature=${temperature.toFixed(1)}`;
    const humidityValue = `VAR humidity=${humidity.toFixed(1)}`;
    const temperatureDocument = new SensorValue({
      value: temperatureValue,
      sensor_type: SENSORS.TEMPERATURE,
    });
    const humidityDocument = new SensorValue({
      value: humidityValue,
      sensor_type: SENSORS.HUMIDITY,
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // January is month 0, so we add 1 to get the correct month number
    const season = getSeasonNumberByMonth(currentMonth);

    const seasonValue = `VAR season=${season}`;
    const seasonDocument = new SensorValue({
      value: seasonValue,
      sensor_type: SENSORS.SEASON,
    });

    const currentHour = currentDate.getHours();
    let timeOfTheDay = discretizeHour(currentHour);
    const timeOfTheDayValue = `VAR hour=${timeOfTheDay}`;
    const timeDocument = new SensorValue({
      value: timeOfTheDayValue,
      sensor_type: SENSORS.HOUR,
    });

    // TODO make sure soil will write to database!!!!
    // const currentSoil = getLatestSoilMoisture();
    // const timeOfTheDayValue = `VAR Soil=${timeOfTheDay}`;
    // const timeDocument = new SensorValue({
    //   value: Soil,
    //   sensor_type: "hour",
    // });

    await Promise.all([temperatureDocument.save(), humidityDocument.save(), seasonDocument.save(), timeDocument.save()]);

    console.log(`Temperature: ${temperature} Humidity: ${humidity} saved to database.`);
  } catch (error) {
    console.error(error);
  }
};


const updateAcMode = async (mode) => {
  try {
    const response = await axios.patch(
      `https://home.sensibo.com/api/v2/pods/${process.env.SENSIBO_DEVICE_ID}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`,
      {
        acState: {
          on: true,
          mode: mode,
        },
      }
    );
    return { statusCode: 200, data: response.data.result };
  } catch (err) {
    return { statusCode: 403, data: err.message };
  }
};

const updateSensiboMode = async (deviceId, mode) => {
  try {
    const response = await axios.post(`https://home.sensibo.com/api/v2/pods/${deviceId}/acStates?apiKey=${process.env.SENSIBO_API_KEY}`, {
      acState: {
        on: true,
        mode,
      },
    });
    const updateDB = await updateDeviceModeInDatabase(deviceId, mode);

    if ((response.status == 200) && updateDB) {
      await addingDataToCsv()
      return { success: true, data: response.data };
    }

  } catch (error) {
    console.error("Error updating Sensibo mode:", error);
    return { success: false, message: "Error updating mode" };
  }
};

module.exports = {
  switchAcState,
  getAcState,
  getSensiboSensors,
  parseSensorAndWriteToMongo,
  analyzeFunc,
  updateAcMode,
  updateSensiboMode,
};
