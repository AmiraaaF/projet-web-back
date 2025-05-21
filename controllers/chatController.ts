import db from "../models/db.ts";

// Enregistre un message dans la base
export function saveMessage(senderId: number, content: string): void {
  db.query(
    "INSERT INTO messages (sender_id, content) VALUES (?, ?)",
    [senderId, content]
  );
}

// Formate un message pour diffusion via WebSocket
export function formatChatMessage(username: string, content: string, room = "general") {
  return JSON.stringify({
    type: "chat_message",
    username,
    message: content,
    room_id: room,
  });
}
