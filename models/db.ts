import { DB } from "http://deno.land/x/sqlite/mod.ts";

// Création/connexion à la base de données SQLite locale
export const db = new DB("database.sqlite");

// =========================
// Création des tables SQL
// =========================

// Table des utilisateurs
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

// Table des posts (forum/actualités)
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

// Table des parkings
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

// Table des messages du chat
db.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
  );
`);

// Table des commentaires (liés à un post ou à un parking)
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

// Table des salons de chat
db.query(`
  CREATE TABLE IF NOT EXISTS chat_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );
`);

// =========================
// Création du dossier uploads pour stocker les fichiers envoyés
// =========================
const uploadDir = "uploads";
try {
  await Deno.stat(uploadDir); // Vérifie si le dossier existe déjà
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    await Deno.mkdir(uploadDir); // Crée le dossier s'il n'existe pas
    console.log("Dossier 'uploads' créé !");
  }
}

export default db;
