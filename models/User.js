const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// basic method to check password
userSchema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);

