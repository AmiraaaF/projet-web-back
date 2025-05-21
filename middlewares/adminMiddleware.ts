import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { verify } from "https://deno.land/x/djwt/mod.ts";
import { getUserByUsername } from "../models/userModel.ts"; 
import { secretKey } from "../utils/jwt.ts";


export const adminMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const cookie = ctx.request.headers.get("cookie");
  const authToken = cookie?.split("; ").find(row => row.startsWith("auth_token="))?.split("=")[1];

  if (!authToken) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Missing token" };
    return;
  }

  try {
    const tokenData = await verify(authToken, secretKey);
    const user = getUserByUsername(tokenData.userName);

    if (!user || user.role !== "admin") {
      ctx.response.status = 403;
      ctx.response.body = { error: "Forbidden: Admin only" };
      return;
    }

    ctx.state.user = user;
    await next();
  } catch (err) {
    console.error(err);
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Invalid token" };
  }
};
