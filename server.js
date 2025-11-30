require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const getDBStatus = require('./config/db').getDBStatus;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// connect to database (non-blocking)
connectDB();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// session setup - use memory store if DB not available
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
};

// only use MongoDB store if we have a connection string
if (process.env.MONGODB_URI) {
  try {
    sessionConfig.store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    });
  } catch (err) {
    console.log('Using memory store for sessions (MongoDB not available)');
  }
}

app.use(session(sessionConfig));

// make user info available to all views
app.use(function(req, res, next) {
  res.locals.currentUser = req.session.userId ? {
    id: req.session.userId,
    username: req.session.username
  } : null;
  next();
});

// set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/posts', require('./routes/postRoutes'));
app.use('/api', require('./routes/apiRoutes'));
app.use('/', require('./routes/userRoutes'));

// landing page
app.get('/', async function(req, res) {
  try {
    // if DB not connected, show empty state
    if (!getDBStatus()) {
      return res.render('index', { recentPosts: [] });
    }

    const Post = require('./models/Post');
    const User = require('./models/User');

    // get public users
    const publicUsers = await User.find({ isPrivate: false }).select('_id');
    const publicUserIds = publicUsers.map(u => u._id);

    // get recent public posts
    const recentPosts = await Post.find({
      isPublic: true,
      author: { $in: publicUserIds }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'username');

    res.render('index', { recentPosts: recentPosts });
  } catch (err) {
    console.error('Home page error:', err);
    // on error, just show empty state
    res.render('index', { recentPosts: [] });
  }
});

// start server
app.listen(PORT, function() {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!getDBStatus() && !process.env.MONGODB_URI) {
    console.log('Database not connected');
    console.log('   You can view pages but features requiring DB won\'t work');
  }
});

