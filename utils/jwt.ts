import { create, verify } from "https://deno.land/x/djwt/mod.ts";
export const secretKey = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode("votre-cle-secrete-ultra-securisee"),
  { name: "HMAC", hash: "SHA-512" },
  false,
  ["sign", "verify"]
);

export async function createToken(payload: any) {
  return await create({ alg: "HS512", typ: "JWT" }, payload, secretKey);}