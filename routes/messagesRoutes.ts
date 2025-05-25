import express from "express";
import db from "./db";
import { authenticateToken } from "./middlewares";

const router = express.Router();

// ✅ Obtenir les messages d’un salon spécifique
router.get("/api/messages", authenticateToken, async (req, res) => {
    const roomId = req.query.room_id as string;

    if (!roomId) {
        return res.status(400).json({ error: "Paramètre 'room_id' requis" });
    }

    try {
        const result = await db.query(
            `SELECT messages.id, messages.content, messages.created_at, messages.room_id,
                    users.username
             FROM messages
             JOIN users ON messages.user_id = users.id
             WHERE messages.room_id = $1
             ORDER BY messages.created_at ASC`,
            [roomId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Erreur lors de la récupération des messages :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// ✅ Envoyer un message dans un salon
router.post("/api/messages", authenticateToken, async (req, res) => {
    const { message, room_id } = req.body;
    const user_id = req.user.id;

    if (!message || !room_id) {
        return res.status(400).json({ error: "Le message et le room_id sont requis" });
    }

    try {
        const result = await db.query(
            `INSERT INTO messages (content, user_id, room_id, created_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING id, content, created_at`,
            [message, user_id, room_id]
        );

        const newMessage = {
            id: result.rows[0].id,
            content: result.rows[0].content,
            created_at: result.rows[0].created_at,
            user_id,
            room_id
        };

        res.status(201).json(newMessage);
    } catch (err) {
        console.error("Erreur lors de l'enregistrement du message :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// ✅ Supprimer un message (réservé à l’admin)
router.delete("/admin/messages/:id", authenticateToken, async (req, res) => {
    const messageId = req.params.id;
    const userRole = req.user.role;

    if (userRole !== "admin") {
        return res.status(403).json({ error: "Accès interdit. Admin requis." });
    }

    try {
        await db.query("DELETE FROM messages WHERE id = $1", [messageId]);
        res.json({ message: "Message supprimé avec succès" });
    } catch (err) {
        console.error("Erreur suppression message :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;
