import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { getParkings, createParking } from "../controllers/parkingController.ts";
import { adminMiddleware } from "../middlewares/adminMiddleware.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";
const router = new Router();

// =========================
// Route GET /api/parkings
// =========================
// Permet de récupérer la liste des parkings proches d'une position (lat/lon)
// Les coordonnées sont passées en paramètres de requête (?lat=...&lon=...)
router.get("/api/parkings", (ctx) => {
  const url = ctx.request.url;
  const lat = parseFloat(url.searchParams.get("lat") || "");
  const lon = parseFloat(url.searchParams.get("lon") || "");

  // Vérifie que les coordonnées sont valides
  if (isNaN(lat) || isNaN(lon)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Latitude ou longitude manquante" };
    return;
  }

  // Appelle le contrôleur pour récupérer les parkings et retourne la liste
  ctx.response.status = 200;
  ctx.response.body = getParkings(lat, lon);
});

// =========================
// Route POST /api/parkings
// =========================
// Permet d'ajouter un nouveau parking (authentification requise)
// Les données sont envoyées en JSON dans le body de la requête
router.post("/api/parkings", adminMiddleware, async (ctx) => {
  // Récupère les données du parking depuis le body JSON
  const { nom, adresse } = await ctx.request.body({ type: "json" }).value;

  // Vérifie que toutes les données sont présentes et valides
  if (!nom || !adresse ) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Données manquantes ou invalides" };
    return;
  }
  // Géocodage de l'adresse avec Nominatim
  try {
    const query = encodeURIComponent(adresse);
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    const geoData = await geoRes.json();

    if (geoData.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Adresse introuvable." };
      return;
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    await createParking(nom, adresse, lat, lon);

    ctx.response.status = 201;
    ctx.response.body = { message: "Parking ajouté avec succès" };
  } catch (e) {
    console.error("Erreur géocodage :", e);
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors du géocodage de l'adresse" };
  }
  

  
});

export default router;
