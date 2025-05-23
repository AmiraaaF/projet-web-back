import { db } from "../models/db.ts";

export async function getProfile(ctx: any) {
  const tokenData = ctx.state.tokenData;
  const user = db.query("SELECT id, username, role FROM users WHERE username = ?", [tokenData.userName])[0];
  console.log("USER DEBUG:", user);
  if (user) {
    ctx.response.body = { id: user[0], username: user[1], role: user[2] };
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "User not found" };
  }
}
