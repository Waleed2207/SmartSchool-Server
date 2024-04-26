const Room = require("../models/Room");
const Space = require("../models/Space");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
    get_Space,
    createNewSpace,
    get_Space_ByID,
    updateDeviceModeInDatabase,
    create_Space,
    create_Space_TORoom,
  } = require("./../services/space.service.js");

  exports.spaceControllers = {

    async get_Space(req, res) {
        const space = await get_Space();
        return res.json(space);
    },
    async get_Space_ByID(req, res) {
    try {
        const spaceID = req.params.spaceId; 
        console.log(spaceID);
        const space = await get_Space_ByID(spaceID);
        if (!space) {
            return res.status(404).send({ message: 'space not found' });
        }
        return res.status(200).send(space); // Send the room data directly
    } catch (err) {
        return res.status(500).send({ message: err.message }); // Handle any other errors
    }
    },
    async create_Space(req, res) {
        try {
          const { spaceDetails } = req.body; // Assuming the request body has space details directly
          const response = await createNewSpace(spaceDetails);
          return res.status(response.statusCode).send(response.data);
        } catch (err) {
          return res.status(500).send(err.message);
        }
      },
      
    async create_Space_TORoom(req, res) {
        const { id, space_id } = req.body;
        const response = await addDeviceToRoom(id, space_id);
        return res.json(response);
    
      },

  };