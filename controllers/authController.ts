import { create, verify } from "https://deno.land/x/djwt/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { getUserByUsername, getHash, createUser } from "../models/userModel.ts";
import { secretKey } from "../utils/jwt.ts";

// fonction d'authentification
export async function login(username: string, password: string) {
  const user = getUserByUsername(username);
  
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Nom d'utilisateur ou mot de passe incorrect" };
  }

  const token = await create(
    { alg: "HS512", typ: "JWT" },
    { userName: user.username, role: user.role, id: user.id },
    secretKey
  );

  return { token, username: user.username, role: user.role };
}

// fonction d'enregistrement
export async function register(username: string, password: string) {
  if (getUserByUsername(username)) {
    return { error: "Nom d'utilisateur déjà pris" };
  }

  const passwordHash = await getHash(password);
  createUser(username, passwordHash, "user");

  const token = await create({ alg: "HS512", typ: "JWT" }, { userName:username, role: "user"  }, secretKey);
  return { token, username, role: "user" };
}
export function getProfile(username: string) {
  const user = getUserByUsername(username);
  return user ? { username: user.username, id: user.id } : null;
}