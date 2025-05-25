import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
import { db } from "../models/db.ts";

const roomsRouter = new Router();

roomsRouter.post("/rooms", authorizationMiddleware, async (ctx) => {
  try {
    // On vérifie s'il y a un body
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Aucune donnée envoyée." };
      return;
    }

    // On récupère le JSON du body
    
    const body = await ctx.request.body.json();


    // On vérifie si le champ "name" est bien fourni
    const { name } = body;
    if (!name || typeof name !== "string" || name.trim() === "") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Nom de salon invalide" };
      return;
    }

    // On insère le salon dans la base de données
    db.query("INSERT INTO chat_rooms (name) VALUES (?)", [name.trim()]);

     // Log pour vérifier l'insertion
    console.log(`Salon "${name}" inséré avec succès.`);

    ctx.response.status = 201;
    ctx.response.body = { message: "Salon créé avec succès" };
  } catch (err) {
    console.error("Erreur création salon :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la création du salon", details: err.message };
  }
});

roomsRouter.get("/rooms", authorizationMiddleware, async (ctx) => {
  try {
    const rooms = db.query("SELECT * FROM chat_rooms");
    ctx.response.body = rooms;
  } catch (err) {
    console.error("Erreur récupération salons :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération des salons", details: err.message };
  }
});


export default roomsRouter;
