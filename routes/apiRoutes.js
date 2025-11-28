const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/posts - list all public posts from public users
router.get('/posts', async function(req, res) {
  try {
    const publicUsers = await User.find({ isPrivate: false }).select('_id');
    const publicUserIds = publicUsers.map(u => u._id);

    const posts = await Post.find({
      isPublic: true,
      author: { $in: publicUserIds }
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username')
      .select('title content isPublic createdAt updatedAt author');

    res.json(posts);
  } catch (err) {
    console.error('API get posts error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/posts/:id - get a single post
router.get('/posts/:id', async function(req, res) {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // check if post is public or belongs to current user
    const isOwner = req.session.userId && post.author._id.toString() === req.session.userId;
    const author = await User.findById(post.author._id);

    if (!post.isPublic && !isOwner) {
      return res.status(403).json({ error: 'Post is private' });
    }

    if (author.isPrivate && !isOwner) {
      return res.status(403).json({ error: 'User account is private' });
    }

    res.json(post);
  } catch (err) {
    console.error('API get post error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /api/posts - create a post (requires auth)
router.post('/posts', requireAuth, async function(req, res) {
  const { title, content, isPublic } = req.body;

  // basic validation
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const newPost = new Post({
      author: req.session.userId,
      title: title.trim(),
      content: content.trim(),
      isPublic: isPublic === true || isPublic === 'true'
    });

    await newPost.save();
    await newPost.populate('author', 'username');

    res.status(201).json(newPost);
  } catch (err) {
    console.error('API create post error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// PUT /api/posts/:id - update a post (only if owner)
router.put('/posts/:id', requireAuth, async function(req, res) {
  const { title, content, isPublic } = req.body;

  // basic validation
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // check if user owns this post
    if (post.author.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    post.title = title.trim();
    post.content = content.trim();
    post.isPublic = isPublic === true || isPublic === 'true';
    post.updatedAt = Date.now();

    await post.save();
    await post.populate('author', 'username');

    res.json(post);
  } catch (err) {
    console.error('API update post error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// DELETE /api/posts/:id - delete a post (only if owner)
router.delete('/posts/:id', requireAuth, async function(req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // check if user owns this post
    if (post.author.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('API delete post error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;

