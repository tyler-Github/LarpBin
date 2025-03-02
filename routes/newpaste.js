const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// New paste route
router.get('/', (req, res) => {
    // Check if the user is authenticated
    const username = req.cookies.username || 'Anonymous';

    // Render the newpaste page with the username
    res.render('pages/newpaste', { username: username });
});

router.post('/', (req, res) => {
    const { title, content, text_color } = req.body; // Accept text_color
    const generatedTitle = title ? title : generateRandomTitle();
    
    if (!content) {
        return res.status(400).send('Content is required');
    }

    const username = req.cookies.username || 'Anonymous';
    const contentSize = Buffer.byteLength(content, 'utf-8');

    // Insert the new paste including text_color
    const sql = `INSERT INTO pastes (title, content, created_at, user_name, content_size, text_color) VALUES (?, ?, datetime("now"), ?, ?, ?)`;
    db.run(sql, [generatedTitle, content, username, contentSize, text_color || '#FFFFFF'], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

// Function to generate a random title
function generateRandomTitle() {
    const prefix = Math.random() < 0.5 ? 'Anonymous Post' : 'Untitled';
    const randomNumber = Math.floor(Math.random() * 10000) + 1; // Random number between 1 and 10000
    return `${prefix} ${randomNumber}`;
}



module.exports = router;
