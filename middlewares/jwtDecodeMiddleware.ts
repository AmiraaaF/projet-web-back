// middleware qui décode le token JWT (auth_token) pour toutes les requêtes, même celles qui ne sont pas protégées.

import { verify } from "http://deno.land/x/djwt/mod.ts"; // Pour vérifier et décoder les JWT
import { secretKey } from "../utils/jwt.ts"; // Clé secrète utilisée pour signer les JWT

// Middleware qui décode le JWT s'il est présent dans les cookies de la requête
// - Permet d'avoir les infos utilisateur (tokenData) dans ctx.state même sur les routes publiques
// - N'empêche pas la requête de continuer si le token est absent ou invalide
export async function jwtDecodeMiddleware(ctx, next) {
  // Récupère le header "cookie" de la requête HTTP
  const cookie = ctx.request.headers.get("cookie");
  // Extrait le token JWT du cookie "auth_token" s'il existe
  const authToken = cookie?.split("; ").find(row => row.startsWith("auth_token="))?.split("=")[1];
  if (authToken) {
    try {
      // Si le token existe et est valide, on le décode et on le stocke dans ctx.state.tokenData
      ctx.state.tokenData = await verify(authToken, secretKey);
    } catch {
      // Si le token est invalide, on met tokenData à null (pas d'utilisateur authentifié)
      ctx.state.tokenData = null;
    }
  }
  // Passe à la suite de la chaîne de middlewares ou à la route demandée
  await next();
}
