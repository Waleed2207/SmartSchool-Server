const Device = require("../models/Device");
const RoomDevice = require("../models/RoomDevice");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
    getDevices,
    updateDeviceModeInDatabase,
    getDeviceByName,
    addDeviceToRoom,
    getDevicesByRoomId,
    setRoomDeviceState,
    createNewDevice,
    getRoomDevicesTest,
  } = require("./../services/devices.service.js");

exports.devicescontrollers = {

  // Get all devices from DB
  async getDevices(req, res) {
    const devices = await getDevices();
    return res.json(devices);
  },
  async getDeviceByName(req, res) {
    const device = await getDeviceByName(req.params.name);
    return res.json(device);
  },
  async getDevicesWithThresholds(req, res) {
    const devices = await Device.find({}, { device_id: 1, threshold: 1, _id: 0 });
    return res.json(devices);
  },
  async getDeviceByRoomID(req, res) {
    const roomId = req.params.roomId;
    const devices = await getDevicesByRoomId(roomId);
    return res.json(devices);

  },
  async getRoomDeviceByRoomID(req, res) {
    const roomId = req.params.roomId;
    const devices = await getRoomDevicesTest(roomId);
    return res.json(devices);

  },
  async getRoomDeviceTESTByRoomID(req, res) {
    const roomId = req.params.roomId;
    const devices = await getRoomDevicesTest(roomId);
    return res.json(devices);

  },
  async createDevice(req, res) {
    try {
        const { device, room_id } = req.body;
        const response = await createNewDevice(device, room_id);
        return res.status(200).send(response.data);
      } catch (err) {
        return res.status(500).send(err.message);
      }
  },
  async createDeviceTORooom(req, res) {
    const { device_id, room_id, device_state } = req.body;
    const response = await addDeviceToRoom(device_id, room_id, device_state);
    return res.json(response);

  },
  async updateDeviceMode(req, res) {
    const { deviceId, mode } = req.body;
    try {
      await updateDeviceModeInDatabase(deviceId, mode);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error updating mode in the database" });
    }

  },
  async updateRoomDeviceState(req, res) {
    try {
        const { state, id } = req.body;
        //const response = await setRoomDeviceState(id, state);
        const response = await setRoomDeviceState(id, state);
    
        if (response.statusCode !== 200) {
          throw new Error(response.message);
        }
        res.send(response);
      } catch (err) {
        return res.status(500).send(err.message);
      }
  },
    

}  