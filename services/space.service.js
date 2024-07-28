const Room = require("../models/Room");
const Space = require("../models/Space");

const get_Space = async () => {
    try {
      const spaces = await Space.find();
      return spaces;
    } catch (err) {
      console.log(err);
    }
  };
  const addRoomToSpace = async (spaceId, roomType ,Icon) => {
    const newRoom = new Room({
      id: `${spaceId}-${Math.floor(1000 + Math.random() * 9000)}`, // Generating a simple unique room ID
      space_id: spaceId,
      name: roomType === "SmartSchool" ? "Class247" : "Living Room",
      name_space: roomType, 
      icon: Icon // Default empty icon, can be updated to reflect the type of room
    });
  
    try {
      await newRoom.save();
    } catch (err) {
      console.error("Error adding room to space:", err);
      throw err; // Rethrow the error to handle it in the calling function
    }
  };
  
  const createNewSpace = async (spaceDetails) => {
    if (!spaceDetails) {
      console.error("No space details provided");
      return {
        statusCode: 400,
        message: "No space details provided",
      };
    }
  
    try {
      const { type, space_name, icon, city,rasp_ip } = spaceDetails;
      const newSpace_id = Math.floor(10000000 + Math.random() * 90000000);
      const newSpace = new Space({
        space_id: newSpace_id,
        space_name,
        type,
        icon,
        city,
        rasp_ip
      });
      const Icon = icon === "school" ? "ClassRoom" : (icon === "home" ? "couch" : "other");
      await newSpace.save();
      await addRoomToSpace(newSpace_id, type, Icon);
  
      return {
        statusCode: 200,
        data: "Space and initial room created successfully",
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        message: err.message,
      };
    }
  };
  const get_Space_By_ID = async (spaceId) => {
    try {
      const space = await Space.findOne({ space_id: spaceId });  // Find one space with the given space_id
      if (!space) {
        console.log(`No space found for ID: ${spaceId}`);
        return null;  // Return null if no space is found
      }
      return {statusCode: 200,
              data: space};  
    } catch (err) {
      console.error(`Error fetching space with ID ${spaceId}:`, err);
      throw new Error(err.message);  // Throw any other errors to be handled by the caller
    }
  }
  const get_Space_By_Name = async (space_name) => {
    try {
      const space = await Space.find({ type: space_name });  // Find one space with the given space_id
      if (!space) {
        console.log(`No space found for ID: ${space_name}`);
        return null;  // Return null if no space is found
      }
      return {statusCode: 200,
              data: space};  
    } catch (err) {
      console.error(`Error fetching space with ID ${spaceId}:`, err);
      throw new Error(err.message);  // Throw any other errors to be handled by the caller
    }
  }
  

  module.exports = {
    get_Space,
    createNewSpace,
    addRoomToSpace,
    get_Space_By_ID,
    get_Space_By_Name
  }  