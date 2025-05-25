import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
import { db } from "../models/db.ts";

const roomsRouter = new Router();

// ➕ Création de salon
roomsRouter.post("/rooms", authorizationMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body.value;
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Nom de salon invalide" };
      return;
    }

    db.query("INSERT INTO chat_rooms (name) VALUES (?)", [name.trim()]);
    ctx.response.status = 201;
    ctx.response.body = { message: "Salon créé avec succès" };
  } catch (err) {
    console.error("Erreur création salon :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la création du salon", details: err.message };
  }
});

// 🔄 Récupération des salons
roomsRouter.get("/rooms", (ctx) => {
  try {
    const results = db.query("SELECT id, name FROM chat_rooms ORDER BY name ASC");
    const rooms = results.map(([id, name]) => ({ id, name }));
    ctx.response.body = rooms;
  } catch (err) {
    console.error("Erreur récupération salons :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération des salons." };
  }
});

// 🔍 Pour debug (optionnel)
roomsRouter.get("/debug/rooms", (ctx) => {
  const raw = db.query("SELECT * FROM chat_rooms");
  ctx.response.body = raw;
});

export default roomsRouter;
