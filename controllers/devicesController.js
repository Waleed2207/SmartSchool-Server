// devicesController.js

const Device = require("../models/Device");
const RoomDevice = require("../models/RoomDevice");
// Assuming deviceService encapsulates calls to the Mindolife API

const deviceService = require('../services/devices.service'); // Make sure this path is correct

// Make sure each of these methods is correctly implemented in devices.service
const {
  getMindolifeAllDevices,
  getDevices,
  getDeviceByName,
  getDevicesWithThresholds,
  getDeviceByRoomId, // Ensure naming consistency
  createNewDevice,
  // Other service methods
} = require("../services/devices.service");

exports.getMindolifeAllDevices = async (req, res) => {
  try {
      const devices = await getMindolifeAllDevices();
      sendJsonResponse(res, 200, devices);
  } catch (error) {
      sendJsonResponse(res, 500, { "message": error.message });
  }
};
exports.getDevices = async (req, res) => {
    try {
        const devices = await getDevices();
        sendJsonResponse(res, 200, devices);
    } catch (error) {
        sendJsonResponse(res, 500, { "message": error.message });
    }
};

exports.getDeviceByName = async (req, res) => {
    try {
        const device = await getDeviceByName(req.params.name);
        if (device) {
            sendJsonResponse(res, 200, device);
        } else {
            sendJsonResponse(res, 404, { "message": "Device not found" });
        }
    } catch (error) {
        sendJsonResponse(res, 500, { "message": error.message });
    }
};

exports.getDevicesWithThresholds = async (req, res) => {
    try {
        const devices = await Device.find({}, { device_id: 1, threshold: 1, _id: 0 });
        sendJsonResponse(res, 200, devices);
    } catch (error) {
        sendJsonResponse(res, 500, { "message": error.message });
    }
};

exports.getDeviceByRoomID = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const devices = await getDevicesByRoomId(roomId);
        sendJsonResponse(res, 200, devices);
    } catch (error) {
        sendJsonResponse(res, 500, { "message": error.message });
    }
};

exports.createDevice = async (req, res) => {
    try {
        const { device, room_id } = req.body;
        const response = await createNewDevice(device, room_id);
        sendJsonResponse(res, 200, response);
    } catch (error) {
        sendJsonResponse(res, 500, { "message": error.message });
    }
};

exports.updateDeviceMode = async (req, res) => {
    try {
        const { deviceId, mode } = req.body;
        const success = await updateDeviceModeInDatabase(deviceId, mode);
        if (success) {
            sendJsonResponse(res, 200, { "message": "Device mode updated successfully" });
        } else {
            sendJsonResponse(res, 404, { "message": "Device not found" });
        }
    } catch (error) {
        sendJsonResponse(res, 500, { "message": error.message });
    }
};

exports.updateRoomDeviceState = async (req, res) => {
    try {
        const { state, id } = req.body;
        const response = await setRoomDeviceState(id, state);

        if (response.statusCode !== 200) {
            throw new Error(response.message);
        }
        sendJsonResponse(res, 200, { "message": "Room device state updated" });
    } catch (error) {
        sendJsonResponse(res, 500, { "message": error.message });
    }
};

// Implement the rest of the endpoints similarly.
