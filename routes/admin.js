const express = require('express');
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
    const limit = 10;  // Number of pastes per request
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';

    db.all(
        `SELECT * FROM pastes WHERE title LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
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

module.exports = router;
