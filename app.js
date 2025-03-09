const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { engine } = require('express-handlebars');
const { User, Post } = require('./database'); 

const server = express();

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// View Engine
server.engine('hbs', engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'partials', 'layouts'),  
    partialsDir: path.join(__dirname, 'views', 'partials'),  
    defaultLayout: 'main', 
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,  
        allowProtoMethodsByDefault: true     
    }
}));

server.set('view engine', 'hbs');
server.set('views', path.join(__dirname, 'views'));  


// Serve Static Files
server.use(express.static(path.join(__dirname, 'public')));

server.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.render('index', { posts });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

server.get('/register', (req, res) => {
    res.render('register');
});

server.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send("⚠ Username already exists!");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, userTag: `u/${username}` });

        await newUser.save();
        console.log('New user registered:', newUser); // Log the new user object
        req.session.userId = newUser._id;  

        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

server.get('/login', (req, res) => {
    res.render('login');
});

server.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send("❌ Invalid username or password!");
        }

        req.session.userId = user._id;  
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

server.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.session.userId)
            .populate('posts')
            .populate('likes')
            .populate('dislikes') 
            .populate('saved') 
            .populate('hidden'); 

        if (!user) {
            return res.redirect('/login');
        }

        res.render('profile', { userProfile: user });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

server.get('/profile/overview', (req, res) => {
    res.render('profile/overview', { layout: false });
});

server.get('/profile/posts', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        const userPosts = await Post.find({ user: req.session.userId }).populate('user');

        res.render('profile/posts', { layout: false, posts: userPosts });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Internal Server Error');
    }
});

server.get('/profile/comments', (req, res) => {
    res.render('profile/comments', { layout: false }); 
});

server.get('/profile/saved', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.session.userId).populate('saved');

        if (!user) {
            return res.redirect('/login');
        }

        res.render('profile/saved', { layout: false, posts: user.saved });
    } catch (err) {
        console.error("Error fetching saved posts:", err);
        res.status(500).send("Internal Server Error");
    }
});

server.get('/profile/hidden', (req, res) => {
    res.render('profile/hidden', { layout: false }); 
});

server.get('/profile/likes', (req, res) => {
    res.render('profile/likes', { layout: false }); 
});

server.get('/profile/dislikes', (req, res) => {
    res.render('profile/dislikes', { layout: false }); 
});

server.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

server.post('/create-post', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const { caption, imageUrl } = req.body;

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(400).send("❌ User not found!");
        }

        const newPost = new Post({
            user: user._id,
            caption,
            imageUrl
        });

        await newPost.save();

        user.posts.push(newPost._id); 
        await user.save();

        res.redirect('/profile');
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).send("Internal Server Error");
    }
});

const port = process.env.PORT || 9090;
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
