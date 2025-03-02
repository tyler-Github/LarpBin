const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// Middleware to check admin status
function isAdmin(req, res, next) {
    if (!req.cookies || req.cookies.Admin !== 'true') {
        return res.status(403).send('Access denied');
    }
    next();
}

// Admin Panel Page
router.get('/', isAdmin, (req, res) => {
    res.render('pages/admin', { username: req.cookies.username });
});

// API for paginated pastes
router.get('/pastes', isAdmin, (req, res) => {
    const limit = 10;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';

    db.all(
        `SELECT * FROM pastes WHERE title LIKE ? 
         ORDER BY pinned DESC, created_at DESC LIMIT ? OFFSET ?`,
        [search, limit, offset],
        (err, pastes) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(pastes);
        }
    );
});

// API for loading users
router.get('/users', isAdmin, (req, res) => {
    const search = req.query.search ? `%${req.query.search}%` : '%';

    db.all(
        `SELECT id, username, email FROM users WHERE username LIKE ? ORDER BY id DESC`,
        [search],
        (err, users) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(users);
        }
    );
});

// API for loading comments
router.get('/comments', isAdmin, (req, res) => {
    const search = req.query.search ? `%${req.query.search}%` : '%';

    db.all(
        `SELECT comments.id, comments.paste_id, users.username, comments.comment, comments.created_at
         FROM comments
         JOIN users ON comments.user_id = users.id
         WHERE comments.comment LIKE ?
         ORDER BY comments.created_at DESC`,
        [search],
        (err, comments) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(comments);
        }
    );
});


// Delete a paste
router.post('/delete', isAdmin, (req, res) => {
    const pasteId = req.body.pasteId;

    if (!pasteId) return res.status(400).send('Paste ID required');

    db.run('DELETE FROM pastes WHERE id = ?', [pasteId], (err) => {
        if (err) {
            console.error('Error deleting paste:', err);
            return res.status(500).send('Database error');
        }
        res.sendStatus(200);
    });
});

router.post('/toggle-pin', isAdmin, (req, res) => {
    const { pasteId, pinned } = req.body;

    if (!pasteId) return res.status(400).send('Paste ID required');

    db.run('UPDATE pastes SET pinned = ? WHERE id = ?', [pinned, pasteId], (err) => {
        if (err) {
            console.error('Error updating pinned status:', err);
            return res.status(500).send('Database error');
        }
        res.sendStatus(200);
    });
});

// Download Database
router.get('/download-db', isAdmin, (req, res) => {
    const dbPath = path.resolve('./database/pastebin.db');
    
    res.download(dbPath, 'pastebin.db', (err) => {
        if (err) {
            console.error('Error downloading database:', err);
            res.status(500).send('Error downloading database');
        }
    });
});

// Delete a comment
router.post('/delete-comment', isAdmin, (req, res) => {
    const commentId = req.body.commentId;

    if (!commentId) return res.status(400).send('Comment ID required');

    db.run('DELETE FROM comments WHERE id = ?', [commentId], (err) => {
        if (err) {
            console.error('Error deleting comment:', err);
            return res.status(500).send('Database error');
        }
        res.sendStatus(200);
    });
});

// Delete a user and their associated data
router.post('/delete-user', isAdmin, (req, res) => {
    const userId = req.body.userId;

    if (!userId) return res.status(400).send('User ID required');

    db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).send('Database error');
        }
        res.sendStatus(200);
    });
});

// Upload Database
router.post('/upload-db', isAdmin, (req, res) => {
    if (!req.files || !req.files.database) {
        return res.status(400).send('No file uploaded');
    }

    const dbFile = req.files.database;
    const dbPath = path.resolve('./database/pastebin.db');

    dbFile.mv(dbPath, (err) => {
        if (err) {
            console.error('Error uploading database:', err);
            return res.status(500).send('Error uploading database');
        }

        res.send('Database uploaded successfully');
    });
});

module.exports = router;
