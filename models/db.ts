import { DB } from "https://deno.land/x/sqlite/mod.ts";

export const db = new DB("database.sqlite");

// Création des tables
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

db.query(`
  CREATE TABLE IF NOT EXISTS parkings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL, -- Propriétaire/créateur du parking
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      description TEXT,
      price_per_hour REAL,
      available INTEGER DEFAULT 1, -- 1 pour disponible, 0 pour non disponible
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE );
`);
db.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
  );
`);


db.query(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER, -- NULL si c'est un commentaire de parking
    parking_id INTEGER, -- NULL si c'est un commentaire de post
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parking_id) REFERENCES parkings(id) ON DELETE CASCADE,
    CHECK ((post_id IS NOT NULL AND parking_id IS NULL) OR (post_id IS NULL AND parking_id IS NOT NULL))
);
`);
db.query(`
  CREATE TABLE IF NOT EXISTS chat_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );
`);


// Création du dossier uploads
const uploadDir = "uploads";
try {
  await Deno.stat(uploadDir);
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    await Deno.mkdir(uploadDir);
    console.log("Dossier 'uploads' créé !");
  }
}

export default db;
