const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

router.get('/', (req, res) => {
    const { id } = req.query;
    const user_id = req.cookies.user_id || 0;
    const user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    if (!id) {
        return res.status(400).send('Paste ID is required');
    }

    // Check if the user already viewed this paste
    const checkViewSql = `SELECT id FROM views WHERE paste_id = ? AND ip = ? AND user_agent = ?`;
    db.get(checkViewSql, [id, user_ip, user_agent], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }

        if (!row) {
            // If no previous view exists, add a new view
            const addViewSql = `INSERT INTO views (paste_id, ip, user_agent, viewed_at) VALUES (?, ?, ?, ?)`;
            const viewedAt = new Date().toISOString();
            db.run(addViewSql, [id, user_ip, user_agent, viewedAt], (err) => {
                if (err) console.error('Error adding view:', err.message);
            });
        }

        // Fetch the paste and comments with updated views count
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

            // Get updated views count
            db.get(`SELECT COUNT(*) AS views FROM views WHERE paste_id = ?`, [id], (err, result) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send('Internal Server Error');
                }

                const updatedViews = result ? result.views : 0;

                db.all(commentsSql, [id], (err, comments) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).send('Internal Server Error');
                    }

                    // Attach the updated views count
                    paste.views = updatedViews;

                    res.render('pages/viewpaste', { paste, comments, user_id });
                });
            });
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

    const userIdValue = user_id ? parseInt(user_id) : 0; // Ensure it's a valid number

    db.run(sql, [paste_id, userIdValue, comment, createdAt], function (err) {
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
