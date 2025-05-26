
import { create, verify } from "http://deno.land/x/djwt/mod.ts"; // Pour la gestion des JWT (authentification)
import * as bcrypt from "http://deno.land/x/bcrypt/mod.ts"; // Pour le hashage et la vérification des mots de passe
import { getUserByUsername, getHash, createUser } from "../models/userModel.ts"; // Fonctions liées aux utilisateurs (BDD)
import { secretKey } from "../utils/jwt.ts"; // Clé secrète pour signer les JWT

// =========================
// Contrôleur d'authentification
// =========================

// Fonction de connexion (login)
// Prend en entrée un nom d'utilisateur et un mot de passe
// Vérifie si l'utilisateur existe et si le mot de passe est correct
// Retourne un token JWT si la connexion est réussie, sinon une erreur
export async function login(username: string, password: string) {
  const user = getUserByUsername(username); // Cherche l'utilisateur dans la BDD
  
  // Si l'utilisateur n'existe pas ou si le mot de passe est incorrect
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Nom d'utilisateur ou mot de passe incorrect" };
  }

  // Création du token JWT avec les infos de l'utilisateur
  const token = await create(
    { alg: "HS512", typ: "JWT" }, // Header du JWT
    { userName: user.username, role: user.role, id: user.id }, // Payload du JWT
    secretKey // Clé secrète
  );

  // Retourne le token et les infos de l'utilisateur
  return { token, username: user.username, role: user.role };
}

// Fonction d'enregistrement (register)
// Prend en entrée un nom d'utilisateur et un mot de passe
// Vérifie si l'utilisateur existe déjà, sinon crée un nouvel utilisateur
// Retourne un token JWT si l'inscription est réussie, sinon une erreur
export async function register(username: string, password: string) {
  // Vérifie si l'utilisateur existe déjà
  if (getUserByUsername(username)) {
    return { error: "Nom d'utilisateur déjà pris" };
  }

  // Hash le mot de passe
  const passwordHash = await getHash(password);
  // Crée l'utilisateur dans la BDD avec le rôle "user"
  createUser(username, passwordHash, "user");

  // Crée un token JWT pour le nouvel utilisateur
  const token = await create(
    { alg: "HS512", typ: "JWT" },
    { userName: username, role: "user" },
    secretKey
  );
  // Retourne le token et les infos de l'utilisateur
  return { token, username, role: "user" };
}
