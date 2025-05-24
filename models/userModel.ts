import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import {db} from "./db.ts";

export async function getHash(password: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}

export function getUserByUsername(username: string) {
  const result = db.query("SELECT id, role, username, password_hash FROM users WHERE username = ?", [username]);
  return result.length > 0 ? {
    id: result[0][0],
    role: result[0][1],
    username: result[0][2],
    passwordHash: result[0][3]
  } : null;
}


export function createUser(username: string, passwordHash: string, role: string = "user") {
  db.query("INSERT INTO users ( username, password_hash , role) VALUES (?, ?, ?)", [ username, passwordHash, role]);
}
