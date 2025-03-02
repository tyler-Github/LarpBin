const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const offset = (page - 1) * limit;

    const sql = `
        SELECT 
            pastes.*, 
            users.id AS user_id, 
            pastes.pinned,
            (SELECT COUNT(*) FROM views WHERE views.paste_id = pastes.id) AS views_count,
            (SELECT COUNT(*) FROM comments WHERE comments.paste_id = pastes.id) AS comments_count
        FROM pastes 
        LEFT JOIN users ON pastes.user_name = users.username 
        ORDER BY pastes.pinned DESC, pastes.created_at DESC 
        LIMIT ? OFFSET ?
    `;

    db.all(sql, [limit, offset], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        // Count total pastes for pagination
        db.get(`SELECT COUNT(*) AS total FROM pastes`, [], (err, countResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            const totalPastes = countResult.total;
            const totalPages = Math.ceil(totalPastes / limit);

            // Check if user is logged in
            const loggedIn = req.cookies.LoggedIn === 'true';

            if (loggedIn && req.cookies.username) {
                const username = req.cookies.username;
                db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Internal Server Error');
                    }
                    res.render('pages/homepage', { 
                        pastes: rows, 
                        loggedIn: loggedIn, 
                        user: user, 
                        page, 
                        totalPages 
                    });
                });
            } else {
                res.render('pages/homepage', { 
                    pastes: rows, 
                    loggedIn: loggedIn, 
                    page, 
                    totalPages 
                });
            }
        });
    });
});

module.exports = router;
