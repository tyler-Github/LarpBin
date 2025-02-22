const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// Dashboard route
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM pastes ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render('pages/dashboard', { pastes: rows });
    });
});

module.exports = router;
