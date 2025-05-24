import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { getParkings, createParking } from "../controllers/parkingController.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";

const router = new Router();

router.get("/api/parkings", (ctx) => {
  const url = ctx.request.url;
  const lat = parseFloat(url.searchParams.get("lat") || "");
  const lon = parseFloat(url.searchParams.get("lon") || "");

  if (isNaN(lat) || isNaN(lon)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Latitude ou longitude manquante" };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = getParkings(lat, lon);
});

router.post("/api/parkings", authorizationMiddleware, async (ctx) => {
  const { nom, adresse, lat, lon } = await ctx.request.body({ type: "json" }).value;

  if (!nom || !adresse || isNaN(lat) || isNaN(lon)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Données manquantes ou invalides" };
    return;
  }

  await createParking(nom, adresse, lat, lon);
  ctx.response.status = 201;
  ctx.response.body = { message: "Parking ajouté avec succès" };
});

export default router;
