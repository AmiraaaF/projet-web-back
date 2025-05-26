import * as bcrypt from "http://deno.land/x/bcrypt/mod.ts";

// Fonction pour hasher un mot de passe en utilisant bcrypt
// Prend en entrée un mot de passe en clair (string)
// Retourne une promesse qui résout vers le hash sécurisé du mot de passe
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password);
}

// Fonction pour vérifier si un mot de passe correspond à un hash bcrypt
// Prend en entrée le mot de passe en clair et le hash à vérifier
// Retourne une promesse qui résout vers true si le mot de passe correspond, sinon false
export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
