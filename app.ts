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

const app = new Application();

// Configuration CORS
app.use(oakCors({ 
  origin: `http://mon-front.cluster-ig3.igpolytech.fr`,
  credentials: true,
}));
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

console.log(`Serveur démarré sur http://localhost:${PORT}`);
await app.listen({ port: PORT });