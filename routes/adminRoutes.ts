import { adminMiddleware } from "../middlewares/adminMiddleware.ts";
import { Router } from "http://deno.land/x/oak/mod.ts";
import db from "../models/db.ts";


const adminRouter = new Router();
// Supprimer un post (admin only)
adminRouter.delete("/admin/posts/:id", adminMiddleware, (ctx) => {
  const postId = Number(ctx.params.id);
  if (isNaN(postId)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID invalide" };
    return;
  }
  db.query("DELETE FROM posts WHERE id = ?", [postId]);
  ctx.response.status = 204;
});

// Supprimer un message (admin only)
adminRouter.delete("/admin/messages/:id", adminMiddleware, (ctx) => {
  const messageId = Number(ctx.params.id);
  if (isNaN(messageId)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID invalide" };
    return;
  }
  db.query("DELETE FROM messages WHERE id = ?", [messageId]);
  ctx.response.status = 204;
});

// Créer un salon (admin only)
// Ici, il faudrait une table `chat_rooms` dans la BDD, ex :
// CREATE TABLE IF NOT EXISTS chat_rooms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL);
adminRouter.post("/admin/rooms", adminMiddleware, async (ctx) => {
  try {
    const { name } = await ctx.request.body({ type: "json" }).value;
    if (!name || typeof name !== "string" || name.trim() === "") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Nom de salon invalide" };
      return;
    }

    db.query("INSERT INTO chat_rooms (name) VALUES (?)", [name.trim()]);
    ctx.response.status = 201;
    ctx.response.body = { message: "Salon créé avec succès" };
  } catch {
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la création du salon" };
  }
});

// Supprimer un salon (admin only)
adminRouter.delete("/admin/rooms/:id", adminMiddleware, (ctx) => {
  const roomId = Number(ctx.params.id);
  if (isNaN(roomId)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID invalide" };
    return;
  }
  db.query("DELETE FROM chat_rooms WHERE id = ?", [roomId]);
  ctx.response.status = 204;
});

export default adminRouter;
