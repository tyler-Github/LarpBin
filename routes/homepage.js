const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// Homepage route
router.get('/', (req, res) => {
    const sql = `
        SELECT pastes.*, users.id AS user_id 
        FROM pastes 
        LEFT JOIN users ON pastes.user_name = users.username 
        ORDER BY pastes.created_at DESC 
        LIMIT 10
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        
        // Check if user is logged in
        const loggedIn = req.cookies.LoggedIn === 'true';
        
        if (loggedIn && req.cookies.username) {
            const username = req.cookies.username; // Assuming username is stored in the cookie
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
                if (err) {
                    throw err;
                }
                res.render('pages/homepage', { pastes: rows, loggedIn: loggedIn, user: user });
            });
        } else {
            res.render('pages/homepage', { pastes: rows, loggedIn: loggedIn });
        }
    });
});

module.exports = router;
