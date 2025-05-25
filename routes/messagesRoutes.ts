import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
import db from "../models/db.ts";

const router = new Router();

router.get("/api/messages", (ctx) => {
  try {
    const { room_id } = ctx.request.url.searchParams;

    if (!room_id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Paramètre 'room_id' requis." };
      return;
    }

    let query = `
      SELECT m.id, m.content, m.created_at, u.username
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at ASC
    `;
    const params = [room_id];

    const results = db.query(query, params);
    console.log("[DEBUG] Résultats SQL:", results);

    const messages = results.map(([id, content, created_at, username]) => ({
      id,
      content,
      created_at,
      username
    }));

    ctx.response.body = messages;
  } catch (err) {
    console.error("Erreur lors de la récupération des messages :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération des messages." };
  }
});

router.get("/debug/messages", (ctx) => {
  const results = db.query("SELECT * FROM messages");
  ctx.response.body = results;
});

router.post("/api/messages", authorizationMiddleware, async (ctx) => {
  try {
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Aucune donnée envoyée." };
      return;
    }

    const body = await ctx.request.body.json();
    const { sender_id, room_id, content } = body;

    if (!sender_id || !room_id || !content) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Données de message invalides" };
      return;
    }

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
