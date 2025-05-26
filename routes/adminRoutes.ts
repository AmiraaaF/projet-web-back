import { adminMiddleware } from "../middlewares/adminMiddleware.ts"; // Middleware pour vérifier que l'utilisateur est admin
import { Router } from "http://deno.land/x/oak/mod.ts"; // Router Oak pour définir les routes
import db from "../models/db.ts"; // Connexion à la base de données


const adminRouter = new Router();

// =========================
// Routes réservées aux administrateurs
// =========================

// Supprimer un post (admin only)
// Route : DELETE /admin/posts/:id
// Vérifie que l'ID est valide, puis supprime le post de la BDD
adminRouter.delete("/admin/posts/:id", adminMiddleware, (ctx) => {
  const postId = Number(ctx.params.id);
  if (isNaN(postId)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID invalide" };
    return;
  }
  db.query("DELETE FROM posts WHERE id = ?", [postId]);
  ctx.response.status = 204; // Pas de contenu en retour
});

// Supprimer un message (admin only)
// Route : DELETE /admin/messages/:id
// Vérifie que l'ID est valide, puis supprime le message de la BDD
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
// Route : POST /admin/rooms
// Crée un nouveau salon de chat dans la table chat_rooms
adminRouter.post("/admin/rooms", adminMiddleware, async (ctx) => {
  try {
    // Récupère le nom du salon depuis le body JSON
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
// Route : DELETE /admin/rooms/:id
// Supprime un salon de chat par son ID
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
