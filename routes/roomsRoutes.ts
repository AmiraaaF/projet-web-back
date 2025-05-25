import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
import { db } from "../models/db.ts";  // Correction de l'import

const roomsRouter = new Router();
roomsRouter.post("/rooms", authorizationMiddleware, async (ctx) => {
  try {
    // Ajout de logs pour diagnostiquer le problème
    console.log("Headers de la requête:", ctx.request.headers);
    console.log("Type de ctx.request.body:", typeof ctx.request.body);
    
    // Tentative avec la méthode standard d'Oak v17
    let body;
    try {
      // Essai avec la méthode standard
      body = await ctx.request.body({ type: "json" }).value;
      console.log("Body récupéré avec méthode standard:", body);
    } catch (bodyError) {
      console.error("Erreur lors de la récupération du body standard:", bodyError);
      
      // Tentative alternative
      try {
        body = await ctx.request.body.value;
        console.log("Body récupéré avec méthode alternative:", body);
      } catch (altError) {
        console.error("Erreur lors de la récupération alternative du body:", altError);
        throw new Error("Impossible de récupérer le body de la requête");
      }
    }
    
    // Vérification du body
    if (!body) {
      console.error("Body est undefined ou null");
      ctx.response.status = 400;
      ctx.response.body = { error: "Corps de la requête vide ou invalide" };
      return;
    }
    
    const { name } = body;
    console.log("Nom extrait du body:", name);

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

export default roomsRouter;
