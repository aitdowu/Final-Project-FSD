# StackBlog

A multi-user blog site where you can write posts and see what other people are sharing.

## Tech Used

- Node.js
- Express
- MongoDB with Mongoose
- EJS templates
- Vanilla JavaScript
- Plain CSS

## Setup

1. Clone this repo

2. Install dependencies:
   ```
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your MongoDB connection string and session secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/simple-blog
   SESSION_SECRET=your-secret-key-here
   ```

4. (Optional) Run the seed script to create some demo users and posts:
   ```
   node seed.js
   ```
   This will create users: jay, maria, and testuser (all with password: password123)

5. Start the server:
   ```
   node server.js
   ```
   Or if you have nodemon installed:
   ```
   npm run dev
   ```

6. Open your browser and go to `http://localhost:3000`

## Features

- User registration and login
- Create, edit, and delete blog posts
- Public and private posts
- Public and private user accounts
- View feed of public posts
- User profiles
- Simple REST API at `/api/posts`


