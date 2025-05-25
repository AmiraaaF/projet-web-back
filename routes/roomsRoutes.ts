import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
import { db } from "../models/db.ts";  // Correction ici: import { db } au lieu de import db

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

    // Ajout de logs détaillés pour le débogage
    console.log("Tentative de création d'un salon avec le nom:", name);
    
    try {
      // Vérification que la table existe
      const tables = db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_rooms'");
      console.log("Tables trouvées:", [...tables]);
      
      // Exécution de la requête avec plus de détails en cas d'erreur
      db.query("INSERT INTO chat_rooms (name) VALUES (?)", [name.trim()]);
      console.log("Insertion réussie pour le salon:", name);
      
      ctx.response.status = 201;
      ctx.response.body = { message: "Salon créé avec succès" };
    } catch (dbErr) {
      // Log détaillé de l'erreur de base de données
      console.error("Erreur SQL détaillée:", dbErr.message);
      console.error("Stack trace:", dbErr.stack);
      throw dbErr; // Relancer pour être capturé par le catch externe
    }
  } catch (err) {
    console.error("Erreur création salon :", err);
    console.error("Type d'erreur:", typeof err);
    console.error("Message d'erreur:", err.message);
    console.error("Stack trace:", err.stack);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la création du salon", details: err.message };
  }
});

export default roomsRouter;
