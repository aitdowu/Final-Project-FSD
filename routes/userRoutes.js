const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

// show dashboard
router.get('/dashboard', requireAuth, async function(req, res) {
  try {
    const user = await User.findById(req.session.userId);
    const recentPosts = await Post.find({ author: req.session.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'username');

    res.render('dashboard', { user: user, recentPosts: recentPosts });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Something went wrong');
  }
});

// show post history
router.get('/post-history', requireAuth, async function(req, res) {
  try {
    const posts = await Post.find({ author: req.session.userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username');

    res.render('postHistory', { posts: posts });
  } catch (err) {
    console.error('Post history error:', err);
    res.status(500).send('Something went wrong');
  }
});

// show feed (public posts from public users)
router.get('/feed', requireAuth, async function(req, res) {
  try {
    // get public users
    const publicUsers = await User.find({ isPrivate: false }).select('_id');
    const publicUserIds = publicUsers.map(u => u._id);

    // get public posts from public users, or posts from current user
    const posts = await Post.find({
      $or: [
        { isPublic: true, author: { $in: publicUserIds } },
        { author: req.session.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username');

    res.render('feed', { posts: posts });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).send('Something went wrong');
  }
});

// show profile
router.get('/profile', requireAuth, async function(req, res) {
  try {
    const user = await User.findById(req.session.userId);
    const postCount = await Post.countDocuments({ author: req.session.userId });

    res.render('profile', { user: user, postCount: postCount });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Something went wrong');
  }
});

// show settings
router.get('/settings', requireAuth, async function(req, res) {
  try {
    const user = await User.findById(req.session.userId);
    res.render('settings', { errors: [], user: user });
  } catch (err) {
    console.error('Settings error:', err);
    res.status(500).send('Something went wrong');
  }
});

// update settings
router.post('/settings', requireAuth, async function(req, res) {
  const { bio, isPrivate } = req.body;
  const errors = [];

  try {
    const user = await User.findById(req.session.userId);

    user.bio = bio || '';
    user.isPrivate = isPrivate === 'on';

    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error('Settings update error:', err);
    errors.push('Something went wrong. Please try again.');
    res.render('settings', { errors, user: user });
  }
});

// show public profile
router.get('/users/:username', async function(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // check if account is private and visitor is not the owner
    const isOwner = req.session.userId && req.session.userId === user._id.toString();
    if (user.isPrivate && !isOwner) {
      return res.render('privateProfile', { username: user.username });
    }

    // get public posts from this user, or all posts if viewing own profile
    const query = isOwner 
      ? { author: user._id }
      : { author: user._id, isPublic: true };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'username');

    const postCount = await Post.countDocuments({ author: user._id });

    res.render('publicProfile', { 
      profileUser: user, 
      posts: posts, 
      postCount: postCount,
      isOwner: isOwner 
    });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;

