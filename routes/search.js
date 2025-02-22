const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/pastebin.db');

// Search route
router.get('/', (req, res) => {
    // Retrieve the query and type from the request query
    const { query, type } = req.query;

    // Execute the appropriate search query based on the type
    let sql = '';
    if (!type || (type !== 'posts' && type !== 'users')) {
        return res.status(400).send('Invalid search type');
    }

    if (type === 'posts') {
        sql = 'SELECT * FROM pastes WHERE content LIKE ? ORDER BY created_at DESC';
    } else if (type === 'users') {
        sql = `
            SELECT users.*, COUNT(pastes.id) AS paste_count
            FROM users
            LEFT JOIN pastes ON username = pastes.user_name
            WHERE users.username LIKE ?
            GROUP BY users.id
        `;
    }

    db.all(sql, [`%${query}%`], (err, rows) => {
        if (err) {
            throw err;
        }
        
        // Render the search results page with a message indicating no results
        if (rows.length === 0) {
            return res.render('pages/search', { message: `Showing 0 result(s) for "${query}"`, type: type, pastes: [], users: [], query: query, loggedIn: false });
        }
        
        // Render the search results page with the found results
        res.render('pages/search', { pastes: rows, type: type, users: rows, query: query, message: `Showing ${rows.length} result(s) for "${query}"`, loggedIn: false });
    });
});

module.exports = router;
