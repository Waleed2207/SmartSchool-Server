const mongoose = require('mongoose');
const crypto = require('crypto');

const validateObjectId = (req, res, next) => {
  const { room } = req.body;

  // Log the received room ID for debugging
  console.log('Received room ID:', room);

  // Check if room is a valid custom format and convert to ObjectId
  if (/^[0-9a-fA-F-]{8,24}$/.test(room)) {
    // Generate a valid ObjectId from the custom ID using md5 hash
    const hash = crypto.createHash('md5').update(room).digest('hex');
    const objectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
    console.log('Generated ObjectId from custom ID:', objectId);
    req.body.room = objectId;
  } else if (!mongoose.Types.ObjectId.isValid(room)) {
    return res.status(400).json({ error: 'Invalid room ID format' });
  }

  next();
};

module.exports = validateObjectId;
