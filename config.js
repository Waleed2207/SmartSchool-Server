const mongoose = require('mongoose');
require('dotenv').config();

console.log(process.env.MONGO_URL); // This should print your MongoDB URI
const connectDB = async () => {

  try {
    await mongoose.connect(`${process.env.MONGO_URL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
