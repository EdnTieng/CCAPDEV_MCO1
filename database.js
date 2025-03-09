const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/tiktalk_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB at localhost:27017'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

module.exports = mongoose;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: 'profile-placeholder.png' },
    userTag: { type: String, required: true },

    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    saved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    hidden: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    caption: { type: String, required: true },
    imageUrl: { type: String, required: true },

    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
            content: String
        }
    ],

    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

const sampleUsers = [
    { username: "User1", password: "password1", userTag: "u/User1" },
    { username: "User2", password: "password2", userTag: "u/User2" },
    { username: "User3", password: "password3", userTag: "u/User3" },
    { username: "User4", password: "password4", userTag: "u/User4" },
    { username: "User5", password: "password5", userTag: "u/User5" },
    { username: "Archer_User", password: "securepassword", userTag: "u/Archer_User" }
];

const samplePosts = [
    {
        username: "User1",
        caption: "Love this new recipe!",
        imageUrl: "https://hips.hearstapps.com/hmg-prod/images/190509-coconut-chicken-curry-157-1558039780.jpg?crop=1xw:0.8435280189423836xh;center,top&resize=1200:*",
        comments: [
            { username: "Archer_User", content: "Looks Yummy!" },
            { username: "UserB", content: "Can I have some?" },
            { username: "UserC", content: "What's the secret ingredient?" },
            { username: "UserD", content: "One To Go Please!" },
            { username: "UserE", content: "Yummy food!" }
        ]
    },
    {
        username: "User2",
        caption: "Trying out this new coffee shop!",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Latte_and_dark_coffee.jpg",
        comments: [
            { username: "CoffeeLover", content: "That looks delicious!" },
            { username: "UserG", content: "Where is this?" },
            { username: "UserH", content: "I need this right now!" },
            { username: "UserI", content: "Coffee is life ☕" },
            { username: "UserJ", content: "I’ll visit this place soon!" }
        ]
    },
    {
        username: "User3",
        caption: "Beautiful sunset at the beach! 🌅",
        imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/e0/ce/85/sunset-beach.jpg?w=1200&h=-1&s=1",
        comments: [
            { username: "UserA", content: "Wow! Where is this?" },
            { username: "UserB", content: "Perfect vacation spot!" },
            { username: "UserC", content: "I wish I was there right now!" },
            { username: "UserD", content: "Reminds me of my last trip!" },
            { username: "UserE", content: "Nature is amazing!" }
        ]
    },
    {
        username: "User4",
        caption: "Game night with friends! 🎮",
        imageUrl: "https://storage-asset.msi.com/event/2022/cnd/i-want-it-all/images/reason-img-02.jpg",
        comments: [
            { username: "Gamer1", content: "What game are you playing?" },
            { username: "Gamer2", content: "Looks fun!" },
            { username: "UserX", content: "Classic setup!" },
            { username: "UserY", content: "Let’s do a tournament!" },
            { username: "UserZ", content: "Reminds me of the old days!" }
        ]
    },
    {
        username: "User5",
        caption: "Freshly baked cookies! 🍪",
        imageUrl: "https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2022/02/Chocolate-chip-cookies-14.jpg",
        comments: [
            { username: "Foodie1", content: "Those look delicious!" },
            { username: "UserA", content: "Recipe, please?" },
            { username: "UserB", content: "Best way to start the day!" },
            { username: "UserC", content: "Are they chewy or crispy?" },
            { username: "UserD", content: "Cookies make everything better!" }
        ]
    }
];

async function seedUsers() {
    const existingUsers = await User.find();
    if (existingUsers.length === 0) {
        for (let user of sampleUsers) {
            user.password = await bcrypt.hash(user.password, 10);
        }
        await User.insertMany(sampleUsers);
        console.log('✅ Sample Users Added');
    } else {
        console.log('⚡ Users Already Exist');
    }
}

async function seedPosts() {
    const existingPosts = await Post.find();
    if (existingPosts.length === 0) {
        console.log('⚡ Seeding posts...');

        const users = await User.find();
        const userMap = {};
        users.forEach(user => {
            userMap[user.username] = user._id; // Store ObjectId instead of username
        });

        const formattedPosts = samplePosts.map(post => ({
            user: userMap[post.username], // Link to actual User _id
            caption: post.caption,
            imageUrl: post.imageUrl,
            comments: post.comments.map(comment => ({
                user: userMap[comment.username] || null, // Convert comment usernames to ObjectId
                content: comment.content
            }))
        }));

        await Post.insertMany(formattedPosts);
        console.log('✅ Sample Posts Added');
    } else {
        console.log('⚡ Posts Already Exist');
    }
}

mongoose.connection.once('open', async () => {
    console.log('🚀 MongoDB connection established.');
    await seedUsers();
    await seedPosts();
});

module.exports = { mongoose, User, Post };
