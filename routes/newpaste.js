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

// New Paste route
router.post('/', (req, res) => {
    // Retrieve paste data from the request body
    const { title, content } = req.body;

    // Generate a random title if the provided title is empty
    const generatedTitle = title ? title : generateRandomTitle();

    // Check if the content is provided
    if (!content) {
        return res.status(400).send('Content is required');
    }

    // Retrieve the username from the cookies or set it to 'Anonymous'
    const username = req.cookies.username || 'Anonymous';

    // Calculate the size of the content in bytes
    const contentSize = Buffer.byteLength(content, 'utf-8');

    // Insert the new paste into the database along with the username and content size
    const sql = 'INSERT INTO pastes (title, content, created_at, user_name, content_size) VALUES (?, ?, datetime("now"), ?, ?)';
    db.run(sql, [generatedTitle, content, username, contentSize], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }
        // Successfully inserted, redirect to homepage
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
