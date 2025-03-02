const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// Login route with login check
router.get('/', (req, res) => {
    const loggedIn = req.cookies.LoggedIn === 'true';
    
    if (loggedIn) {
        const username = req.cookies.username;
        
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).send("Database error");
            }

            if (!user) {
                res.clearCookie('LoggedIn');
                res.clearCookie('username');
                res.clearCookie('Admin');
                return res.redirect('/login');
            }

            return res.redirect('/');
        });
    } else {
        res.render('pages/login');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('LoggedIn');
    res.clearCookie('username');
    res.clearCookie('Admin');
    res.clearCookie('connect.sid');
    res.clearCookie('user_id');
    res.redirect('/');
});

// Login authentication
router.post('/', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error accessing the database");
        }

        if (!user) {
            return res.status(400).send("Invalid username or password");
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.cookie('LoggedIn', true, { httpOnly: true });
            res.cookie('username', username, { httpOnly: true });
            res.cookie('user_id', user.id, { httpOnly: true });

            // Set Admin cookie if user is an admin
            if (user.admin === 1) {
                res.cookie('Admin', true, { httpOnly: true });
            } else {
                res.cookie('Admin', false, { httpOnly: true });
            }

            res.redirect('/');
        } else {
            res.status(400).send("Invalid username or password");
        }
    });
});

module.exports = router;
