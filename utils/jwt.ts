import { create, verify } from "http://deno.land/x/djwt/mod.ts";

// Génère et importe la clé secrète utilisée pour signer et vérifier les JWT
// On utilise ici HMAC avec SHA-512 pour une sécurité élevée
export const secretKey = await crypto.subtle.importKey(
  "raw", // Format brut de la clé
  new TextEncoder().encode("votre-cle-secrete-ultra-securisee"), // La clé secrète sous forme d'octets
  { name: "HMAC", hash: "SHA-512" }, // Algorithme utilisé
  false, // La clé n'est pas exportable
  ["sign", "verify"] // Les usages autorisés pour cette clé
);

// Fonction utilitaire pour créer un token JWT signé
// Prend en entrée un payload (objet avec les infos à stocker dans le token)
// Retourne une promesse qui résout vers le token JWT signé
export async function createToken(payload: any) {
  return await create({ alg: "HS512", typ: "JWT" }, payload, secretKey);
}
