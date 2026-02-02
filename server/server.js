
import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const verboseSqlite3 = sqlite3.verbose();
const db = new verboseSqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        game_data TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready.');

            // Check if game_data column exists (migration for existing db)
            db.all("PRAGMA table_info(users)", (err, columns) => {
                if (!err) {
                    const hasGameData = columns.some(col => col.name === 'game_data');
                    if (!hasGameData) {
                        db.run("ALTER TABLE users ADD COLUMN game_data TEXT", (err) => {
                            if (err) console.error("Error migrating db:", err);
                            else console.log("Added game_data column.");
                        });
                    }
                }
            });

            seedAdminUser();
        }
    });
}

function seedAdminUser() {
    const adminUsername = 'admin';
    const adminPassword = 'admin'; // In a real app, hash this!

    db.get('SELECT * FROM users WHERE username = ?', [adminUsername], (err, row) => {
        if (err) {
            console.error('Error checking admin user:', err.message);
            return;
        }

        if (!row) {
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [adminUsername, adminPassword], (err) => {
                if (err) {
                    console.error('Error creating admin user:', err.message);
                } else {
                    console.log('Admin user created (admin/admin).');
                }
            });
        }
    });
}

// API Routes

// Register
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.run('INSERT INTO users (username, password, game_data) VALUES (?, ?, ?)', [username, password, '{}'], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, username, success: true });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            let gameData = {};
            try {
                gameData = row.game_data ? JSON.parse(row.game_data) : {};
            } catch (e) {
                console.error("Error parsing game data", e);
            }

            res.json({
                success: true,
                user: {
                    id: row.id,
                    username: row.username,
                    gameData: gameData
                }
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    });
});

// Save Progress
app.post('/api/save', (req, res) => {
    const { userId, gameData } = req.body;

    if (!userId || !gameData) {
        return res.status(400).json({ error: 'User ID and game data required' });
    }

    const gameDataStr = JSON.stringify(gameData);

    db.run('UPDATE users SET game_data = ? WHERE id = ?', [gameDataStr, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Progress saved' });
    });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});
