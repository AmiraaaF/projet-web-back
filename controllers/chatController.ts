import db from "../models/db.ts"; // Import de la connexion à la base de données

// =========================
// Contrôleur du chat
// =========================

// Fonction pour enregistrer un message dans la base de données
// Prend en paramètre l'ID de l'expéditeur et le contenu du message
export function saveMessage(senderId: number, content: string): void {
  db.query(
    "INSERT INTO messages (sender_id, content) VALUES (?, ?)", // Requête SQL pour insérer le message
    [senderId, content] // Paramètres de la requête (sécurise contre l'injection SQL)
  );
}

// Fonction pour formater un message à envoyer via WebSocket
// Prend en paramètre le nom d'utilisateur, le contenu du message et l'identifiant du salon (par défaut "general")
// Retourne une chaîne JSON contenant les informations du message
export function formatChatMessage(username: string, content: string, room = "general") {
  return JSON.stringify({
    type: "chat_message", // Type de message (utile côté client pour filtrer)
    username,             // Nom de l'utilisateur qui envoie le message
    message: content,     // Contenu du message
    room_id: room,        // Identifiant du salon (room)
  });
}
