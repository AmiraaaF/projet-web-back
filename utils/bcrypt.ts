import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password);
}
export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
