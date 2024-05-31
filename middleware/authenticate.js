// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authenticate = async (req, res, next) => {
//   const token = req.header('Authorization').replace('Bearer ', '');
//   try {
//     const secretKey = process.env.JWT_SECRET;
//     console.log('Verifying token with secret:', secretKey);

//     const decoded = jwt.verify(token, secretKey);
//     console.log('Decoded token:', decoded);

//     const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
//     if (!user) {
//       throw new Error('User not found');
//     }

//     req.token = token;
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Token validation error:', error);
//     res.status(401).send({ error: 'Please authenticate.', details: error.message });
//   }
// };

// module.exports = authenticate;




const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).send({ error: 'Authorization header is missing.' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Authorization header is improperly formatted.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error('JWT secret key is not defined in the environment variables.');
    }

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
