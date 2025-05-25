import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
import { db } from "../models/db.ts";

const roomsRouter = new Router();
roomsRouter.post("/rooms", authorizationMiddleware, async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
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
    ctx.response.body = { error: "Erreur lors de la création du salon" };
  }
});


export default roomsRouter;