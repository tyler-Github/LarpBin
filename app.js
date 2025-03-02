const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Set view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(fileUpload());
app.use(session({
    secret: 'fewwwefwefewfnnfwewejfnknwefjwekfjbkwejbkef',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Use 'secure: true' if using HTTPS
}));
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middleware for Passport.js
app.use(passport.initialize());
app.use(passport.session());


// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Database setup
const db = new sqlite3.Database('./database/pastebin.db', (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('Connected to the pastebin database.');
    setupDatabase();
});

function setupDatabase() {
    db.serialize(() => {
        // Create pastes table
        db.run(`CREATE TABLE IF NOT EXISTS pastes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL,
            pinned BOOLEAN NOT NULL DEFAULT 0,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            text_color TEXT NOT NULL DEFAULT '#FFFFFF',
            content_size INTEGER NOT NULL, 
            created_at TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
                process.exit(1);
            }
            console.log('Pastes table created or already exists.');
        });

        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            admin BOOLEAN NOT NULL DEFAULT 0,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
                process.exit(1);
            }
            console.log('Users table created or already exists.');
        });

        // Create views table
        db.run(`CREATE TABLE IF NOT EXISTS views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paste_id INTEGER NOT NULL,
            ip TEXT NOT NULL,
            user_agent TEXT NOT NULL,
            viewed_at TEXT NOT NULL,
            FOREIGN KEY(paste_id) REFERENCES pastes(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating views table:', err.message);
                process.exit(1);
            }
            console.log('Views table created or already exists.');
        });

        // Create comments table
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paste_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            comment TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(paste_id) REFERENCES pastes(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
                process.exit(1);
            }
            console.log('Comments table created or already exists.');
        });
    });
}

// Routes
app.use('/', require('./routes/homepage'));
app.use('/newpaste', require('./routes/newpaste'));
app.use('/users', require('./routes/users'));
app.use('/upgrades', require('./routes/upgrades'));
app.use('/search', require('./routes/search'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/paste', require('./routes/viewpaste'));
app.use('/login', require('./routes/login'));
app.use('/signup', require('./routes/signup'));
app.use('/profile', require('./routes/profile'));
app.use('/admin', require('./routes/admin'));

// Start server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
