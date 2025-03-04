const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const server = express();

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'hbs');

server.engine('hbs', engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'partials','layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')  // ✅ Correct partials directory
}));

// Serve static files
server.use(express.static(path.join(__dirname, 'public')));


// Sample data
server.get('/', (req, res) => {
    const posts = [
        {
            id: 1,
            username: "User1",
            caption: "Love this new recipe!",
            imageUrl: "https://hips.hearstapps.com/hmg-prod/images/190509-coconut-chicken-curry-157-1558039780.jpg?crop=1xw:0.8435280189423836xh;center,top&resize=1200:*",
            comments: [
                { id: 21, username: "Archer_User", content: "Looks Yummy!" },
                { id: 22, username: "UserB", content: "Can I have some?" },
                { id: 23, username: "UserC", content: "What's the secret ingredient?" },
                { id: 24, username: "UserD", content: "One To Go Please!" },
                { id: 25, username: "UserE", content: "Yummy food!" }
            ]
        },
        {
            id: 2,
            username: "User2",
            caption: "Trying out this new coffee shop!",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Latte_and_dark_coffee.jpg",
            comments: [
                { id: 26, username: "CoffeeLover", content: "That looks delicious!" },
                { id: 27, username: "UserG", content: "Where is this?" },
                { id: 28, username: "UserH", content: "I need this right now!" },
                { id: 29, username: "UserI", content: "Coffee is life ☕" },
                { id: 30, username: "UserJ", content: "I’ll visit this place soon!" }
            ]
        },
        {
            id: 3,
            username: "User3",
            caption: "Beautiful sunset at the beach! 🌅",
            imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/e0/ce/85/sunset-beach.jpg?w=1200&h=-1&s=1",
            comments: [
                { id: 31, username: "UserA", content: "Wow! Where is this?" },
                { id: 32, username: "UserB", content: "Perfect vacation spot!" },
                { id: 33, username: "UserC", content: "I wish I was there right now!" },
                { id: 34, username: "UserD", content: "Reminds me of my last trip!" },
                { id: 35, username: "UserE", content: "Nature is amazing!" }
            ]
        },
        {
            id: 4,
            username: "User4",
            caption: "Game night with friends! 🎮",
            imageUrl: "https://storage-asset.msi.com/event/2022/cnd/i-want-it-all/images/reason-img-02.jpg",
            comments: [
                { id: 36, username: "Gamer1", content: "What game are you playing?" },
                { id: 37, username: "Gamer2", content: "Looks fun!" },
                { id: 38, username: "UserX", content: "Classic setup!" },
                { id: 39, username: "UserY", content: "Let’s do a tournament!" },
                { id: 40, username: "UserZ", content: "Reminds me of the old days!" }
            ]
        },
        {
            id: 5,
            username: "User5",
            caption: "Freshly baked cookies! 🍪",
            imageUrl: "https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2022/02/Chocolate-chip-cookies-14.jpg",
            comments: [
                { id: 41, username: "Foodie1", content: "Those look delicious!" },
                { id: 42, username: "UserA", content: "Recipe, please?" },
                { id: 43, username: "UserB", content: "Best way to start the day!" },
                { id: 44, username: "UserC", content: "Are they chewy or crispy?" },
                { id: 45, username: "UserD", content: "Cookies make everything better!" }
            ]
        }
    ];
    
    
    res.render('index', { posts });
});

server.get('/', (req, res) => {
    res.render('index'); // This will render 'views/index.hbs'
});

server.get('/login', (req, res) => {
    res.render('login'); // This will render 'views/login.hbs'
});

server.get('/explore', (req, res) => {
    res.render('explore'); // This will render 'views/explore.hbs'
});


// Start server
const port = process.env.PORT || 9090;
server.listen(port, () => {
    console.log(`Listening at port ${port}`);
});
