const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// Signup route
router.get('/', (req, res) => {
    res.render('pages/signup');
});

router.post('/', async (req, res) => {
    const { username, email, password, confirmpwd } = req.body;

    if (password !== confirmpwd) {
        return res.status(400).send("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString(); // Get current timestamp

    db.run(
        `INSERT INTO users (username, email, password, created_at, admin) VALUES (?, ?, ?, ?, 0)`,
        [username, email, hashedPassword, createdAt],
        function(err) {
            if (err) {
                return res.status(500).send("Error accessing the database");
            }
            res.redirect('/login');
        }
    );
});

module.exports = router;
