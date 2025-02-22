const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// View Paste route
router.get('/', (req, res) => {
    const { id } = req.query;

    // Check if the id parameter is provided
    if (!id) {
        return res.status(400).send('Paste ID is required');
    }

    // Retrieve the paste and user information from the database by paste ID
    const pasteSql = `
        SELECT pastes.*, users.username AS user_name, users.id AS user_id 
        FROM pastes 
        JOIN users ON pastes.user_name = users.username 
        WHERE pastes.id = ?
    `;

    const commentsSql = `
        SELECT comments.*, users.username 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
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

            // Render the viewpaste.ejs template with the paste data and comments
            res.render('pages/viewpaste', { paste, comments });
        });
    });
});

// Handle comment submission
router.post('/comment', (req, res) => {
    const { paste_id, user_id, comment } = req.body;

    if (!paste_id || !user_id || !comment) {
        return res.status(400).send('All fields are required');
    }

    const sql = `
        INSERT INTO comments (paste_id, user_id, comment, created_at) 
        VALUES (?, ?, ?, ?)
    `;
    const createdAt = new Date().toISOString();

    db.run(sql, [paste_id, user_id, comment, createdAt], function (err) {
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

    // Check if the id parameter is provided
    if (!id) {
        return res.status(400).send('Paste ID is required');
    }

    // Retrieve the paste content from the database by ID
    const sql = 'SELECT content FROM pastes WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }
        if (!row) {
            return res.status(404).send('Paste not found');
        }

        // Send the raw content as plain text
        res.type('text/plain').send(row.content);
    });
});

module.exports = router;
