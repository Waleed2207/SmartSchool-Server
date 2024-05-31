// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// const signInUser = async (email, password) => {
//   const user = await User.findOne({ email });
//   if (!user) {
//     return { status: 400, message: 'User not found' };
//   }

//   const isPasswordValid = await user.comparePassword(password);
//   if (!isPasswordValid) {
//     return { status: 400, message: 'Invalid password' };
//   }

//   const token = jwt.sign({ _id: user._id, role: user.role, space_name: user.space_name, space_id: user.space_id }, process.env.JWT_SECRET_KEY, {
//     expiresIn: '1h',
//   });

//   const userData = {
//     _id: user._id,
//     fullName: user.fullName,
//     email: user.email,
//     role: user.role,
//     space_name: user.space_name,
//     space_id: user.space_id,
//   };

//   return { status: 200, message: 'Sign in successful', token, user: userData };
// };

// const registerUser = async (fullName, email, password, role, space_name, space_id) => {
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return { status: 400, message: 'User with this email already exists' };
//   }

//   const user = new User({ fullName, email, password, role, space_name, space_id });
//   await user.save();
//   return { status: 201, message: 'User created successfully' };
// };

// const getUsers = async () => {
//   try{
//     const users = await User.find();
//     return {
//       statusCode: 200,
//       data: users
//     }
//   } catch(err){
//     return {
//       statusCode: err.statusCode,
//       message: err.message
//     }
//   }
// }


// module.exports = {
//   signInUser,
//   registerUser,
//   getUsers
// };





const User = require('../models/User');
const jwt = require('jsonwebtoken');



const signInUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { status: 400, message: 'User not found' };
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return { status: 400, message: 'Invalid password' };
  }

  const secretKey = process.env.JWT_SECRET;
  console.log('Signing token with secret:', secretKey);

  const token = jwt.sign(
    { _id: user._id, role: user.role, space_name: user.space_name, space_id: user.space_id },
    secretKey,
   // { expiresIn: '1h' }
  );

  // Save the token to the user's tokens array
  user.tokens = user.tokens.concat({ token });
  await user.save();

  const userData = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    space_name: user.space_name,
    space_id: user.space_id,
  };

  return { status: 200, message: 'Sign in successful', token, user: userData };
};

const registerUser = async (fullName, email, password, role, space_name, space_id) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { status: 400, message: 'User with this email already exists' };
  }

  const user = new User({ fullName, email, password, role, space_name, space_id });
  await user.save();
  return { status: 201, message: 'User created successfully' };
};

const getUsers = async () => {
  try {
    const users = await User.find();
    return { status: 200, data: users };
  } catch (err) {
    return { status: 500, message: err.message };
  }
};

module.exports = {
  signInUser,
  registerUser,
  getUsers,
};
