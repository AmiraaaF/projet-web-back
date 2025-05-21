import { Application } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import authRoutes from "./routes/authRoutes.ts";
import parkingRoutes from "./routes/parkingRoutes.ts";
import websocketRoutes from "./routes/websocketRoutes.ts";
import postRoutes from "./routes/postsRoutes.ts";
import messagesRoutes from "./routes/messagesRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
const PORT = 3002;
const app = new Application();

// Configuration CORS
app.use(oakCors({ 
  origin: `http://localhost:8060`,
  credentials: true,
}));

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



console.log(`Serveur démarré sur http://localhost:${PORT}`);
await app.listen({ port: PORT });