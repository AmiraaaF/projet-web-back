import { db } from "../models/db.ts"; 

// =========================
// Contrôleur du profil utilisateur
// =========================

// Fonction pour récupérer le profil de l'utilisateur connecté
// - Utilise les informations du token JWT (stockées dans ctx.state.tokenData)
// - Cherche l'utilisateur dans la base de données grâce à son username
// - Retourne les infos principales (id, username, role) si trouvé, sinon une erreur 404
export async function getProfile(ctx: any) {
  const tokenData = ctx.state.tokenData; // Données extraites du token JWT (middleware d'authentification)
  // Recherche l'utilisateur dans la base de données par son username
  const user = db.query(
    "SELECT id, username, role FROM users WHERE username = ?",
    [tokenData.userName]
  )[0];
  console.log("USER DEBUG:", user); // Log pour debug

  if (user) {
    // Si l'utilisateur existe, on retourne ses infos principales
    ctx.response.body = { id: user[0], username: user[1], role: user[2] };
  } else {
    // Sinon, on retourne une erreur 404
    ctx.response.status = 404;
    ctx.response.body = { error: "User not found" };
  }
}
