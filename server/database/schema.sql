CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    acc REAL NOT NULL,
    wpm INTEGER NOT NULL,

    difficulty TEXT NOT NULL CHECK(
        difficulty IN ('easy','medium','hard')
    ),

    mode TEXT NOT NULL CHECK(
        mode IN ('quotes','words')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);