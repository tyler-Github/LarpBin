const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// Profile route
router.get('/', (req, res) => {
    const userId = req.query.uid;

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Database error');
        }

        if (!user) {
            return res.status(404).send('User not found');
        }

        db.all('SELECT * FROM pastes WHERE user_name = ? ORDER BY created_at DESC', [user.username], (err, pastes) => {
            if (err) {
                console.error('Error fetching pastes:', err);
                return res.status(500).send('Database error');
            }

            db.all('SELECT * FROM comments WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, comments) => {
                if (err) {
                    console.error('Error fetching comments:', err);
                    return res.status(500).send('Database error');
                }

                // Render profile page with user info, pastes, and comments
                res.render('pages/profile', {
                    user: user,
                    pastes: pastes,
                    comments: comments,
                    loggedIn: req.cookies.LoggedIn === 'true'
                });
            });
        });
    });
});

module.exports = router;
