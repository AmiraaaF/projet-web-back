import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
import db from "../models/db.ts";

const router = new Router();

// =========================
// Récupérer les messages d'un salon (GET /api/messages?room_id=...)
// =========================
router.get("/api/messages", (ctx) => {
  try {
    // Récupère le paramètre de requête room_id (identifiant du salon)
    const { room_id } = ctx.request.url.searchParams;
    // Prépare la requête SQL pour récupérer les messages et le nom d'utilisateur de l'expéditeur
    let query = `
      SELECT m.id, m.content, m.created_at, u.username
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
    `;
    let params: any[] = [];

    // Si un salon est spécifié, filtre les messages par salon
    if (room_id) {
      query += " WHERE m.room_id = ?";
      params.push(room_id);
    }

    query += " ORDER BY m.created_at ASC"; // Trie les messages par date croissante

    // Exécute la requête SQL
    const results = db.query(query, params);
    console.log("[DEBUG] Résultats SQL:", results);

    // Transforme les résultats SQL en objets JS
    const messages = results.map(([id, content, created_at, username]) => ({
      id,
      content,
      created_at,
      username
    }));

    // Retourne la liste des messages au format JSON
    ctx.response.body = messages;
  } catch (err) {
    console.error("Erreur lors de la récupération des messages :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération des messages." };
  }
});

// =========================
// Route de debug pour voir tous les messages (GET /debug/messages)
// =========================
router.get("/debug/messages", (ctx) => {
  // Retourne tous les messages bruts de la table (pour debug uniquement)
  const results = db.query("SELECT * FROM messages");
  ctx.response.body = results;
});

// =========================
// Envoyer un message (POST /api/messages)
// =========================
router.post("/api/messages", authorizationMiddleware, async (ctx) => {
  try {
    // Vérifie que le body est présent
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Aucune donnée envoyée." };
      return;
    }

    // Récupère le body JSON envoyé par le client
    const body = await ctx.request.body.json();
    const { sender_id, room_id, content } = body;

    // Vérifie que toutes les données nécessaires sont présentes
    if (!sender_id || !room_id || !content) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Données de message invalides" };
      return;
    }

    // Insère le message dans la base de données
    db.query("INSERT INTO messages (sender_id, room_id, content) VALUES (?, ?, ?)", [sender_id, room_id, content]);

    ctx.response.status = 201;
    ctx.response.body = { message: "Message envoyé avec succès" };
  } catch (err) {
    console.error("Erreur envoi message :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de l'envoi du message", details: err.message };
  }
});

export default router;
