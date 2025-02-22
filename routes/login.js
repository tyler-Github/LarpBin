const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// Login route with login check
router.get('/', (req, res) => {
    // Check if user is logged in
    const loggedIn = req.cookies.LoggedIn === 'true';
    if (loggedIn) {
        // If logged in, redirect to the homepage or any other desired page
        const username = req.cookies.username; // Assuming username is stored in the cookie
        // Retrieve user info from the database using username
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) {
                throw err;
            }
            // Redirect to homepage or other page with user info
            return res.redirect('/');
        });
    } else {
        // Render the login page if not logged in
        res.render('pages/login');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    // Clear the 'LoggedIn' and 'username' cookies
    res.clearCookie('LoggedIn');
    res.clearCookie('username');
    res.clearCookie('connect.sid')
    // Redirect the user to the login page or any other desired page
    res.redirect('/');
});

router.post('/', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            return res.status(500).send("Error accessing the database");
        }

        if (!user) {
            return res.status(400).send("Invalid username or password");
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // Preserve existing cookies and set a cookie for logged-in user
            const existingCookies = req.cookies;
            // If the 'LoggedIn' cookie is not already present, add it
            if (!existingCookies.LoggedIn) {
                res.cookie('LoggedIn', true, { httpOnly: true });
            }
            // If the 'username' cookie is not already present, add it
            if (!existingCookies.username) {
                res.cookie('username', username, { httpOnly: true });
            }
            // If the 'connect.sid' cookie is not already present, add it
            if (!existingCookies['connect.sid']) {
                res.cookie('connect.sid', req.sessionID, { httpOnly: true });
            }
            // Restore existing cookies
            Object.keys(existingCookies).forEach(cookieName => {
                res.cookie(cookieName, existingCookies[cookieName], { httpOnly: true });
            });
            res.redirect('/');
        } else {
            res.status(400).send("Invalid username or password");
        }
    });
});

module.exports = router;
