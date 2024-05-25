const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const secretKey = process.env.JWT_SECRET;
    console.log('Verifying token with secret:', secretKey);

    const decoded = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);

    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
    if (!user) {
      throw new Error('User not found');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).send({ error: 'Please authenticate.', details: error.message });
  }
};

module.exports = authenticate;
