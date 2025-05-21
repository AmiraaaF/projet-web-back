import { db } from "../models/db.ts";

export async function getProfile(ctx: any) {
  const tokenData = ctx.state.tokenData;
  const user = db.query("SELECT * FROM users WHERE username = ?", [tokenData.userName])[0];
  if (user) {
    ctx.response.body = { username: user[2], id: user[0], role: user[1] };
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "User not found" };
  }
}
