import { Router } from "http://deno.land/x/oak/mod.ts";
import { verify } from "http://deno.land/x/djwt/mod.ts";
import { secretKey } from "../utils/jwt.ts";
import { saveMessage, formatChatMessage } from "../controllers/chatController.ts";

const router = new Router();
const connections = new Set<WebSocket>();

router.get("/ws", async (ctx) => {
  try {
    const cookieHeader = ctx.request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) ctx.throw(401, "Unauthorized: Missing auth_token");

    const payload = await verify(token, secretKey, "HS512") as {
      id: number;
      userName: string;
    };

    const socket = await ctx.upgrade();
    connections.add(socket);

    console.log(`WebSocket connecté : ${payload.userName}`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const msg = data.message?.trim();
        if (!msg) return;

        saveMessage(payload.id, msg);

        const broadcast = formatChatMessage(payload.userName, msg);

        for (const client of connections) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcast);
          }
        }
      } catch (err) {
        console.error("Erreur message WebSocket :", err);
      }
    };

    socket.onclose = () => {
      connections.delete(socket);
      console.log(`Déconnexion : ${payload.userName}`);
    };

  } catch (err) {
    console.error(" Erreur WebSocket :", err);
    ctx.throw(403, "Forbidden: Invalid or missing token");
  }
});

export default router;
