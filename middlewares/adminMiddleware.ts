import { Context } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { verify } from "http://deno.land/x/djwt/mod.ts";
import { getUserByUsername } from "../models/userModel.ts"; 
import { secretKey } from "../utils/jwt.ts";

// =========================
// Middleware de vérification admin
// =========================

// Ce middleware protège les routes réservées aux administrateurs.
// Il vérifie que le token JWT est présent, valide, et que l'utilisateur a le rôle "admin".

export const adminMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  // Récupère le cookie d'authentification depuis les headers de la requête
  const cookie = ctx.request.headers.get("cookie");
  // Extrait le token JWT du cookie "auth_token"
  const authToken = cookie?.split("; ").find(row => row.startsWith("auth_token="))?.split("=")[1];

  // Si aucun token n'est trouvé, on refuse l'accès (401 Unauthorized)
  if (!authToken) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Missing token" };
    return;
  }

  try {
    // Vérifie et décode le token JWT
    const tokenData = await verify(authToken, secretKey);
    // Récupère l'utilisateur correspondant au nom d'utilisateur dans le token
    const user = getUserByUsername(tokenData.userName);

    // Si l'utilisateur n'existe pas ou n'est pas admin, on refuse l'accès (403 Forbidden)
    if (!user || user.role !== "admin") {
      ctx.response.status = 403;
      ctx.response.body = { error: "Forbidden: Admin only" };
      return;
    }

    // Si tout est OK, on ajoute l'utilisateur au contexte et on passe à la suite
    ctx.state.user = user;
    await next();
  } catch (err) {
    // Si le token est invalide ou une autre erreur survient, on refuse l'accès (401 Unauthorized)
    console.error(err);
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Invalid token" };
  }
};
