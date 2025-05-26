import { Context } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { verify } from "http://deno.land/x/djwt/mod.ts";
import { secretKey } from "../utils/jwt.ts"; 

// =========================
// Middleware d'authentification (JWT)
// =========================

// Ce middleware protège les routes qui nécessitent que l'utilisateur soit connecté.
// Il vérifie la présence et la validité du token JWT dans les cookies de la requête.

export const authorizationMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  // Récupère le header "cookie" de la requête HTTP
  const cookie = ctx.request.headers.get("cookie");
  // Extrait le token JWT du cookie "auth_token"
  const authToken = cookie?.split("; ").find(row => row.startsWith("auth_token="))?.split('=')[1];

  // Si aucun token n'est trouvé, on refuse l'accès (401 Unauthorized)
  if (!authToken) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Missing token" };
    return;
  }

  try {
    // (Debug) Affiche le token et la clé secrète dans la console
    console.log("Token:", authToken, secretKey);
    // Vérifie et décode le token JWT
    const tokenData = await verify(authToken, secretKey);
    // (Debug) Affiche les données du token dans la console
    console.log(tokenData);
    // Ajoute les données du token au contexte pour les routes suivantes
    ctx.state.tokenData = tokenData;
    // Passe à la suite de la chaîne de middlewares ou à la route protégée
    await next();
  } catch {
    // Si le token est invalide ou une erreur survient, on refuse l'accès (401 Unauthorized)
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Invalid token" };
  }
};
