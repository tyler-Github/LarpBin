const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// View Paste route
router.get('/', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).send('Paste ID is required');
    }

    // Use COALESCE to default to "Anonymous" if no user is found
    const pasteSql = `
        SELECT pastes.*, COALESCE(users.username, 'Anonymous') AS user_name, users.id AS user_id 
        FROM pastes 
        LEFT JOIN users ON pastes.user_name = users.username 
        WHERE pastes.id = ?
    `;

    const commentsSql = `
        SELECT comments.*, COALESCE(users.username, 'Anonymous') AS username 
        FROM comments 
        LEFT JOIN users ON comments.user_id = users.id 
        WHERE comments.paste_id = ? 
        ORDER BY comments.created_at DESC
    `;

    db.get(pasteSql, [id], (err, paste) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }
        if (!paste) {
            return res.status(404).send('Paste not found');
        }

        db.all(commentsSql, [id], (err, comments) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Internal Server Error');
            }

            res.render('pages/viewpaste', { paste, comments });
        });
    });
});

// Handle comment submission
router.post('/comment', (req, res) => {
    const { paste_id, user_id, comment } = req.body;

    if (!paste_id || !comment) {
        return res.status(400).send('Paste ID and comment are required');
    }

    const sql = `
        INSERT INTO comments (paste_id, user_id, comment, created_at) 
        VALUES (?, ?, ?, ?)
    `;
    const createdAt = new Date().toISOString();

    db.run(sql, [paste_id, user_id || null, comment, createdAt], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect(`/paste?id=${paste_id}`);
    });
});

// View Raw Paste route
router.get('/viewraw', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).send('Paste ID is required');
    }

    const sql = 'SELECT content FROM pastes WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }
        if (!row) {
            return res.status(404).send('Paste not found');
        }

        res.type('text/plain').send(row.content);
    });
});

module.exports = router;
