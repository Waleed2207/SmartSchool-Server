const { default: axios } = require("axios");
require("dotenv").config();
const _ = require("lodash");
const { addingDataToCsv } = require("../utils/machineLearning.js");
const TOKEN = process.env.SMARTTHINGS_TOKEN;
const URL = "https://api.smartthings.com/v1";

const smartThingsGetDevices = async () => {
  const deviceId = process.env.DEVICE_ID;
  try {
    const response = await axios.get(`${URL}/devices/${deviceId}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    return response.data;
  } catch (err) {
    console.log("Can't get SmartThings devices: ", err);
  }
};

const switchWasherWater = async (deviceId, status) => {
  const command = {
    component: "main",
    capability: "switch",
    command: status ? "on" : "off",
    arguments: [],
  };
  try {
    const response = await axios.post(
      `${URL}/devices/${deviceId}/commands`,
      {
        commands: [{ ...command }],
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
    await addingDataToCsv()();
    return response;
  } catch (err) {
    console.log(`Can't switch status to washer water: ${err}`);
  }
};

const getLaundryDetails = async () => {
  try {
    const deviceId = process.env.LAUNDRY_DEVICE_ID;
    const response = await axios.get(
      `${URL}/devices/${deviceId}/status`,
      {
        headers: {
          token: "c6f8ad13-7be7-4c4e-8f8c-bf2590d30c16",
          Authorization: "Bearer c6f8ad13-7be7-4c4e-8f8c-bf2590d30c16",
        },
      }
    );

    const mainComponent = _.get(response, "data.components.main", {});

    const temperature = _.get(
      mainComponent["custom.washerWaterTemperature"],
      "washerWaterTemperature.value"
    );
    const rinse = _.get(
      mainComponent["custom.washerRinseCycles"],
      "washerRinseCycles.value"
    );
    const spin = _.get(
      mainComponent["custom.washerSpinLevel"],
      "washerSpinLevel.value"
    ).toString();

    return { temperature, rinse, spin };
  } catch (err) {
    console.log("Can't get laundry details: ", err.message);
  }
};

module.exports = {
  smartThingsGetDevices,
  switchWasherWater,
  getLaundryDetails,
};
