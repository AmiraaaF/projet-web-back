// middleware qui décode le token JWT (
// auth_token) pour toutes les requêtes, même celles qui ne sont pas protégées.

import { verify } from "http://deno.land/x/djwt/mod.ts";
import { secretKey } from "../utils/jwt.ts";

export async function jwtDecodeMiddleware(ctx, next) {
  const cookie = ctx.request.headers.get("cookie");
  const authToken = cookie?.split("; ").find(row => row.startsWith("auth_token="))?.split("=")[1];
  if (authToken) {
    try {
      ctx.state.tokenData = await verify(authToken, secretKey);
    } catch {
      ctx.state.tokenData = null;
    }
  }
  await next();
}
