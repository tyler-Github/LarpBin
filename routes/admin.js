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
