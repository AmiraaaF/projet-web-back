import { Router } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { login, register } from "../controllers/authController.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";

const router = new Router();

router.post("/login", async (ctx) => {
  const body = await ctx.request.body.json();
  const result = await login(body.username, body.password);
  
  if (result.error) {
    ctx.response.status = 401;
    ctx.response.body = result;
    return;
  }

  ctx.cookies.set("auth_token", result.token, { 
    httpOnly: true, 
    secure: false, 
    maxAge: 60 * 60 * 24, 
    sameSite: "strict" 
  });
  ctx.response.status = 200;
  ctx.response.body = { message: "success" };
});

router.post("/register", async (ctx) => {
  const body = await ctx.request.body.json();
  const result = await register(body.username, body.password);
  
  if (result.error) {
    ctx.response.status = 400;
    ctx.response.body = result;
    return;
  }

  ctx.cookies.set("auth_token", result.token, { 
    httpOnly: true, 
    secure: false, 
    maxAge: 60 * 60 * 24, 
    sameSite: "strict" 
  });
  ctx.response.status = 201;
  ctx.response.body = { message: "User successfully registered" };
});

// Route de déconnexion
router.post("/logout", (ctx) => {
  ctx.cookies.delete("auth_token", { path: "/" });
  ctx.response.status = 200;
  ctx.response.body = { message: "Logged out successfully" };
});
export default router;
