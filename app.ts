import { Application } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import authRoutes from "./routes/authRoutes.ts";
import parkingRoutes from "./routes/parkingRoutes.ts";
import websocketRoutes from "./routes/websocketRoutes.ts";
import postRoutes from "./routes/postsRoutes.ts";
import messagesRoutes from "./routes/messagesRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import { jwtDecodeMiddleware } from "./middlewares/jwtDecodeMiddleware.ts";
import { getProfile } from "./controllers/profileController.ts";
import roomsRouter from "./routes/roomsRoutes.ts";
const PORT = parseInt(Deno.env.get("PORT") ?? "3002");

// Au début de app.ts, après les imports
console.log("Démarrage de l'application Parkly...");




const app = new Application();

// Configuration CORS
app.use(oakCors({ 
  origin: `https://projet-web-front.cluster-ig3.igpolytech.fr`,
  credentials: true,
} ));



app.use(jwtDecodeMiddleware);
// Routes
app.use(adminRoutes.routes());
app.use(adminRoutes.allowedMethods());

app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

app.use(postRoutes.routes());
app.use(postRoutes.allowedMethods());

app.use(parkingRoutes.routes());
app.use(parkingRoutes.allowedMethods());

app.use(websocketRoutes.routes());
app.use(websocketRoutes.allowedMethods());

app.use(messagesRoutes.routes());
app.use(messagesRoutes.allowedMethods());

app.use(roomsRouter.routes());
app.use(roomsRouter.allowedMethods());

app.use(getProfile);

console.log(`Serveur démarré sur https://localhost:${PORT}`);
// Route pour la racine
app.use((ctx) => {
  if (ctx.request.url.pathname === "/") {
    ctx.response.body = { message: "API Parkly en ligne" };
  }
});

// Juste avant d'écouter sur le port
console.log(`Serveur prêt à écouter sur le port ${PORT}`);

await app.listen({ port: PORT });
