require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const connectDB = require('./config/db');

async function seed() {
  try {
    // connect to database
    connectDB();
    
    // wait a bit for connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // clear existing data (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');
    
    // create users
    const saltRounds = 10;
    const passwordHash1 = bcrypt.hashSync('password123', saltRounds);
    const passwordHash2 = bcrypt.hashSync('password123', saltRounds);
    const passwordHash3 = bcrypt.hashSync('password123', saltRounds);
    
    const jay = new User({
      username: 'jay',
      email: 'jay@example.com',
      passwordHash: passwordHash1,
      bio: 'just a regular person who likes to write stuff',
      isPrivate: false
    });
    await jay.save();
    console.log('Created user: jay');
    
    const maria = new User({
      username: 'maria',
      email: 'maria@example.com',
      passwordHash: passwordHash2,
      bio: 'student, blogger, coffee enthusiast',
      isPrivate: false
    });
    await maria.save();
    console.log('Created user: maria');
    
    const testuser = new User({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: passwordHash3,
      bio: '',
      isPrivate: true
    });
    await testuser.save();
    console.log('Created user: testuser');
    
    // create posts
    const post1 = new Post({
      author: jay._id,
      title: 'trying out this blog thing lol',
      content: 'so i just signed up for this blog site and figured i should write something. not really sure what to say but here we are. maybe i\'ll post more stuff later if i think of anything interesting.',
      isPublic: true
    });
    await post1.save();
    console.log('Created post 1');
    
    const post2 = new Post({
      author: jay._id,
      title: 'did not really plan this post but here we are',
      content: 'just writing random thoughts i guess. this is pretty cool actually. might use this more often.',
      isPublic: true
    });
    await post2.save();
    console.log('Created post 2');
    
    const post3 = new Post({
      author: maria._id,
      title: 'first post!',
      content: 'hey everyone! this is my first post on the blog. excited to see what other people are writing about. feel free to check out my other posts if i make any!',
      isPublic: true
    });
    await post3.save();
    console.log('Created post 3');
    
    const post4 = new Post({
      author: maria._id,
      title: 'random thoughts',
      content: 'sometimes i just like to write things down. helps me think better. anyway, hope everyone is having a good day!',
      isPublic: true
    });
    await post4.save();
    console.log('Created post 4');
    
    const post5 = new Post({
      author: testuser._id,
      title: 'private post',
      content: 'this is a private post that only i can see because my account is set to private.',
      isPublic: false
    });
    await post5.save();
    console.log('Created post 5 (private)');
    
    console.log('\nSeed data created successfully!');
    console.log('You can now log in with:');
    console.log('  - jay / password123');
    console.log('  - maria / password123');
    console.log('  - testuser / password123');
    
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();

