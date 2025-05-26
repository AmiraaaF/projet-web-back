import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { login, register } from "../controllers/authController.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";

const router = new Router();

// =========================
// Route de connexion (login)
// =========================
router.post("/login", async (ctx) => {
  // Récupère le corps de la requête (JSON) contenant username et password
  const body = await ctx.request.body.json();
  // Appelle la fonction login du contrôleur d'authentification
  const result = await login(body.username, body.password);
  
  // Si erreur (mauvais identifiants), retourne une erreur 401
  if (result.error) {
    ctx.response.status = 401;
    ctx.response.body = result;
    return;
  }

  // Si succès, crée un cookie HTTP-only contenant le token JWT
  ctx.cookies.set("auth_token", result.token, { 
    httpOnly: true,      // Le cookie n'est pas accessible en JS côté client
    secure: false,       // À mettre à true en production (HTTPS)
    maxAge: 60 * 60 * 24, // Durée de validité : 1 jour
    sameSite: "strict"   // Protection CSRF
  });
  ctx.response.status = 200;
  ctx.response.body = { message: "success" };
});

// =========================
// Route d'inscription (register)
// =========================
router.post("/register", async (ctx) => {
  // Récupère le corps de la requête (JSON) contenant username et password
  const body = await ctx.request.body.json();
  // Appelle la fonction register du contrôleur d'authentification
  const result = await register(body.username, body.password);
  
  // Si erreur (utilisateur déjà existant, etc.), retourne une erreur 400
  if (result.error) {
    ctx.response.status = 400;
    ctx.response.body = result;
    return;
  }

  // Si succès, crée un cookie HTTP-only contenant le token JWT
  ctx.cookies.set("auth_token", result.token, { 
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24,
    sameSite: "strict"
  });
  ctx.response.status = 201;
  ctx.response.body = { message: "User successfully registered" };
});

// =========================
// Route de déconnexion (logout)
// =========================
router.post("/logout", (ctx) => {
  // Supprime le cookie auth_token pour déconnecter l'utilisateur
  ctx.cookies.delete("auth_token", { path: "/" });
  ctx.response.status = 200;
  ctx.response.body = { message: "Logged out successfully" };
});

export default router;
