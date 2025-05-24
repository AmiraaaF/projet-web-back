import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { verify } from "https://deno.land/x/djwt/mod.ts";
import { secretKey } from "../utils/jwt.ts"; 

export const authorizationMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const cookie = ctx.request.headers.get("cookie");
  const authToken = cookie?.split("; ").find(row => row.startsWith("auth_token="))?.split('=')[1];

  if (!authToken) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Missing token" };
    return;
  }

  try {
    console.log("Token:", authToken, secretKey);
    const tokenData = await verify(authToken, secretKey);
    console.log(tokenData);
    ctx.state.tokenData = tokenData;
    await next();
  } catch {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized: Invalid token" };
  }
};
