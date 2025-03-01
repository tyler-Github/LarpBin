#!/usr/bin/env node

const readline = require('readline');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Set SQLite database path
const dbPath = path.join(__dirname, 'database', 'pastebin.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
});

// Function to prompt user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

// Function to create admin user
async function createAdminUser(username, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const email = `${username}@admin.local`;
        const createdAt = new Date().toISOString();

        const sql = `INSERT INTO users (username, email, password, created_at, admin) VALUES (?, ?, ?, ?, 1)`;

        db.run(sql, [username, email, hashedPassword, createdAt], function (err) {
            if (err) {
                console.error('❌ Error inserting admin user:', err.message);
            } else {
                console.log(`✅ Admin user '${username}' created successfully! (Admin: true)`);
            }
            db.close();
            rl.close();
        });
    } catch (error) {
        console.error('❌ Error hashing password:', error.message);
        db.close();
        rl.close();
    }
}

// Ask for username and password
rl.question('Enter Admin Username: ', (username) => {
    if (!username.trim()) {
        console.error('❌ Error: Username cannot be empty!');
        rl.close();
        db.close();
        return;
    }

    rl.stdoutMuted = true;
    rl.question('Enter Admin Password: ', (password) => {
        console.log('');
        if (!password.trim()) {
            console.error('❌ Error: Password cannot be empty!');
            rl.close();
            db.close();
            return;
        }
        createAdminUser(username, password);
    });

    rl._writeToOutput = function (stringToWrite) {
        if (rl.stdoutMuted) rl.output.write('*');
        else rl.output.write(stringToWrite);
    };
});
