import * as bcrypt from "http://deno.land/x/bcrypt/mod.ts"; // Pour le hashage et la vérification des mots de passe
import { db } from "./db.ts"; // Import de la connexion à la base de données

// Fonction pour générer un hash sécurisé à partir d'un mot de passe en clair
// Utilise bcrypt avec un nombre de tours de salage (saltRounds)
export async function getHash(password: string): Promise<string> {
  const saltRounds = 10; // Nombre de tours pour le salage (plus = plus sécurisé mais plus lent)
  const salt = await bcrypt.genSalt(saltRounds); // Génère un sel aléatoire
  return await bcrypt.hash(password, salt); // Retourne le hash du mot de passe
}

// Fonction pour récupérer un utilisateur par son nom d'utilisateur
// Retourne un objet utilisateur (id, role, username, passwordHash) ou null si non trouvé
export function getUserByUsername(username: string) {
  const result = db.query(
    "SELECT id, role, username, password_hash FROM users WHERE username = ?",
    [username]
  );
  // Si un utilisateur est trouvé, on retourne ses infos sous forme d'objet
  return result.length > 0 ? {
    id: result[0][0],
    role: result[0][1],
    username: result[0][2],
    passwordHash: result[0][3]
  } : null; // Sinon, on retourne null
}

// Fonction pour créer un nouvel utilisateur dans la base de données
// Prend en paramètre le nom d'utilisateur, le hash du mot de passe et le rôle (par défaut "user")
export function createUser(username: string, passwordHash: string, role: string = "user") {
  db.query(
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
    [username, passwordHash, role]
  );
}
