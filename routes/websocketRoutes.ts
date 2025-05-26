import { Router } from "http://deno.land/x/oak/mod.ts";
import { verify } from "http://deno.land/x/djwt/mod.ts";
import { secretKey } from "../utils/jwt.ts";
import { saveMessage, formatChatMessage } from "../controllers/chatController.ts";

// Création d'un nouveau routeur Oak
const router = new Router();
// Ensemble pour stocker toutes les connexions WebSocket actives
const connections = new Set<WebSocket>();

// =========================
// Route GET /ws (WebSocket)
// =========================
// Cette route gère la connexion WebSocket pour le chat en temps réel
router.get("/ws", async (ctx) => {
  try {
    // Récupère le header "cookie" pour extraire le token JWT
    const cookieHeader = ctx.request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch?.[1];

    // Si aucun token n'est trouvé, refuse la connexion
    if (!token) ctx.throw(401, "Unauthorized: Missing auth_token");

    // Vérifie et décode le token JWT pour authentifier l'utilisateur
    const payload = await verify(token, secretKey, "HS512") as {
      id: number;
      userName: string;
    };

    // Passe la connexion HTTP en WebSocket
    const socket = await ctx.upgrade();
    // Ajoute la connexion à l'ensemble des connexions actives
    connections.add(socket);

    console.log(`WebSocket connecté : ${payload.userName}`);

    // Gestion de la réception d'un message depuis un client
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // Parse le message reçu
        const msg = data.message?.trim();
        if (!msg) return; // Ignore les messages vides

        // Sauvegarde le message dans la base de données
        saveMessage(payload.id, msg);

        // Formate le message pour l'envoi à tous les clients
        const broadcast = formatChatMessage(payload.userName, msg);

        // Envoie le message à tous les clients connectés
        for (const client of connections) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcast);
          }
        }
      } catch (err) {
        console.error("Erreur message WebSocket :", err);
      }
    };

    // Gestion de la fermeture de la connexion WebSocket
    socket.onclose = () => {
      connections.delete(socket); // Retire la connexion de l'ensemble
      console.log(`Déconnexion : ${payload.userName}`);
    };

  } catch (err) {
    // Gestion des erreurs d'authentification ou de connexion
    console.error("Erreur WebSocket :", err);
    ctx.throw(403, "Forbidden: Invalid or missing token");
  }
});

export default router;
