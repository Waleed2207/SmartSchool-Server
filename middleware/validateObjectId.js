const mongoose = require('mongoose');
const crypto = require('crypto');

const validateObjectId = (req, res, next) => {
  const roomId = req.params.roomId || req.body.room;

  // Log the received room ID for debugging
  console.log('Received room ID:', roomId);

  // Check if room is a valid custom format and convert to ObjectId
  if (/^[0-9a-fA-F-]{8,24}$/.test(roomId)) {
    // Generate a valid ObjectId from the custom ID using md5 hash
    const hash = crypto.createHash('md5').update(roomId).digest('hex');
    const objectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
    console.log('Generated ObjectId from custom ID:', objectId);
    if (req.params.roomId) {
      req.params.roomId = objectId;
    } else if (req.body.room) {
      req.body.room = objectId;
    }
  } else if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID format' });
  }

  next();
};

module.exports = validateObjectId;
