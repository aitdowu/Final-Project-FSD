const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// show register form
router.get('/register', function(req, res) {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('register', { errors: [], formData: {} });
});

// handle registration
router.post('/register', async function(req, res) {
  const { username, email, password } = req.body;
  const errors = [];
  const formData = { username, email };

  // basic validation
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (!email || !email.includes('@')) {
    errors.push('Please enter a valid email');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.render('register', { errors, formData });
  }

  try {
    // check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      errors.push('Username or email already taken');
      return res.render('register', { errors, formData });
    }

    // hash password
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    // create user
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase(),
      passwordHash: passwordHash
    });

    await newUser.save();

    // log them in
    req.session.userId = newUser._id.toString();
    req.session.username = newUser.username;

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    errors.push('Something went wrong. Please try again.');
    res.render('register', { errors, formData });
  }
});

// show login form
router.get('/login', function(req, res) {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { errors: [], formData: {} });
});

// handle login
router.post('/login', async function(req, res) {
  const { username, password } = req.body;
  const errors = [];
  const formData = { username };

  if (!username || !password) {
    errors.push('Please enter both username and password');
    return res.render('login', { errors, formData });
  }

  try {
    const user = await User.findOne({ username: username.trim() });

    if (!user) {
      errors.push('Invalid username or password');
      return res.render('login', { errors, formData });
    }

    if (!user.checkPassword(password)) {
      errors.push('Invalid username or password');
      return res.render('login', { errors, formData });
    }

    // create session
    req.session.userId = user._id.toString();
    req.session.username = user.username;

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    errors.push('Something went wrong. Please try again.');
    res.render('login', { errors, formData });
  }
});

// logout
router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;

