import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import db from "../models/db.ts";

const router = new Router();

router.get("/api/messages", (ctx) => {
  try {
    const results = db.query(`
      SELECT m.id, m.content, m.created_at, u.username
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      ORDER BY m.created_at ASC
    `);
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

export default router;
