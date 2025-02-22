const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'pastebin.db');

function initializeDatabase() {
    if (!fs.existsSync(dbPath)) {
        const db = new sqlite3.Database(dbPath);

        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS pastes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL,
                    email TEXT NOT NULL,
                    joined_at TEXT NOT NULL
                )
            `);

            // Optionally, insert some initial data
            db.run(`
                INSERT INTO pastes (title, content, created_at) VALUES 
                ('First Paste', 'This is the content of the first paste.', '2024-06-03T12:00:00Z'),
                ('Second Paste', 'This is the content of the second paste.', '2024-06-03T13:00:00Z')
            `);

            db.run(`
                INSERT INTO users (username, email, joined_at) VALUES 
                ('user1', 'user1@example.com', '2024-06-03T12:00:00Z'),
                ('user2', 'user2@example.com', '2024-06-03T13:00:00Z')
            `);
        });

        db.close();
    }
}

initializeDatabase();
