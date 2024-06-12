const mongoose = require('mongoose');
require('dotenv').config();
const { initializeLinkedList } = require('./services/calendar.service');

const connectDB = async () => {

  try {
    await mongoose.connect(`${process.env.MONGO_URL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    initializeLinkedList(); 
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err);
  }
};


module.exports = connectDB;
