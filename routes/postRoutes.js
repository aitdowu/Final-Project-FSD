const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// show new post form
router.get('/new', requireAuth, function(req, res) {
  res.render('newPost', { errors: [], formData: {} });
});

// create new post
router.post('/', requireAuth, async function(req, res) {
  const { title, content, isPublic } = req.body;
  const errors = [];
  const formData = { title, content, isPublic: isPublic === 'on' };

  // basic validation
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (errors.length > 0) {
    return res.render('newPost', { errors, formData });
  }

  try {
    const newPost = new Post({
      author: req.session.userId,
      title: title.trim(),
      content: content.trim(),
      isPublic: isPublic === 'on'
    });

    await newPost.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Post creation error:', err);
    errors.push('Something went wrong. Please try again.');
    res.render('newPost', { errors, formData });
  }
});

// show edit post form
router.get('/:id/edit', requireAuth, async function(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    // check if user owns this post
    if (post.author.toString() !== req.session.userId) {
      return res.status(403).send('You can only edit your own posts');
    }

    res.render('editPost', { errors: [], post: post });
  } catch (err) {
    console.error('Edit post error:', err);
    res.status(500).send('Something went wrong');
  }
});

// update post
router.post('/:id/edit', requireAuth, async function(req, res) {
  const { title, content, isPublic } = req.body;
  const errors = [];

  // basic validation
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    // check if user owns this post
    if (post.author.toString() !== req.session.userId) {
      return res.status(403).send('You can only edit your own posts');
    }

    if (errors.length > 0) {
      return res.render('editPost', { errors, post: post });
    }

    post.title = title.trim();
    post.content = content.trim();
    post.isPublic = isPublic === 'on';
    post.updatedAt = Date.now();

    await post.save();
    res.redirect('/post-history');
  } catch (err) {
    console.error('Update post error:', err);
    errors.push('Something went wrong. Please try again.');
    res.render('editPost', { errors, post: { title, content, isPublic: isPublic === 'on' } });
  }
});

// delete post
router.post('/:id/delete', requireAuth, async function(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    // check if user owns this post
    if (post.author.toString() !== req.session.userId) {
      return res.status(403).send('You can only delete your own posts');
    }

    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/post-history');
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;

