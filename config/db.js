const mongoose = require('mongoose');

let isConnected = false;

function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.log('MONGODB_URI not found - running in preview mode (no database)');
    return;
  }

  mongoose.connect(mongoURI)
    .then(function() {
      console.log('Connected to MongoDB');
      isConnected = true;
    })
    .catch(function(err) {
      console.log('MongoDB connection error - running in preview mode:', err.message);
      // don't exit, just run without DB
    });
}

function getDBStatus() {
  return isConnected;
}

module.exports = connectDB;
module.exports.getDBStatus = getDBStatus;

