import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
import { db } from "../models/db.ts";

const roomsRouter = new Router();

// =========================
// Route POST /rooms
// =========================
// Permet de créer un nouveau salon de chat (authentification requise)
roomsRouter.post("/rooms", authorizationMiddleware, async (ctx) => {
  try {
    // Vérifie qu'il y a bien un body dans la requête
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Aucune donnée envoyée." };
      return;
    }

    // Récupère le JSON du body de la requête
    const body = await ctx.request.body.json();

    // Vérifie que le champ "name" est bien fourni et valide
    const { name } = body;
    if (!name || typeof name !== "string" || name.trim() === "") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Nom de salon invalide" };
      return;
    }

    // Insère le nouveau salon dans la base de données
    db.query("INSERT INTO chat_rooms (name) VALUES (?)", [name.trim()]);

    // Log pour vérifier l'insertion
    console.log(`Salon "${name}" inséré avec succès.`);

    ctx.response.status = 201;
    ctx.response.body = { message: "Salon créé avec succès" };
  } catch (err) {
    // Gestion des erreurs lors de la création du salon
    console.error("Erreur création salon :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la création du salon", details: err.message };
  }
});

// =========================
// Route GET /rooms
// =========================
// Permet de récupérer la liste de tous les salons (authentification requise)
roomsRouter.get("/rooms", authorizationMiddleware, async (ctx) => {
  try {
    // Récupère tous les salons de la table chat_rooms
    const rooms = db.query("SELECT * FROM chat_rooms");
    ctx.response.body = rooms;
  } catch (err) {
    // Gestion des erreurs lors de la récupération des salons
    console.error("Erreur récupération salons :", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération des salons", details: err.message };
  }
});

export default roomsRouter;
