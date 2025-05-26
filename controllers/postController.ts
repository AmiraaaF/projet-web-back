import { RouterContext } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { db } from "../models/db.ts";

// =========================
// Contrôleur des posts (forum/actualités)
// =========================

// Fonction pour récupérer tous les posts
// - Récupère tous les posts de la base de données, avec les infos de l'auteur
// - Ajoute le rôle de l'utilisateur courant (si connecté) à chaque post pour la gestion des droits côté front
export const getPosts = (ctx: RouterContext<any, any, any>) => {
  try {
    // Requête SQL pour récupérer tous les posts et les infos de l'auteur
    const postsResult = db.query(
      "SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.username as author_username, u.role as author_role FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC"
    );
    
    // Récupérer le rôle de l'utilisateur actuel s'il est connecté (pour afficher ou non les boutons admin)
    let currentUserRole = null;
    if (ctx.state.tokenData) {
      const userResult = db.query("SELECT role FROM users WHERE id = ?", [ctx.state.tokenData.id]);
      if (userResult.length > 0) {
        currentUserRole = userResult[0][0];
      }
    }

    // Transformer les résultats SQL en objets JS plus lisibles
    const posts = postsResult.map((row: any) => {
      return {
        id: row[0],
        title: row[1],
        content: row[2],
        created_at: row[3],
        updated_at: row[4],
        author_username: row[5],
        author_role: row[6],
        current_user_role: currentUserRole // Pour le front (affichage conditionnel)
      };
    });
    ctx.response.body = posts;
  } catch (error: any) {
    // Gestion des erreurs serveur
    console.error("[DEBUG] postController.ts - ERREUR DÉTAILLÉE dans getPosts:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
        error: "Erreur lors de la récupération des posts.", 
        details: error.message || "Aucun détail d'erreur spécifique fourni par l'objet erreur."
    };
  }
};

// Fonction pour créer un nouveau post
// - Nécessite que l'utilisateur soit authentifié (token dans ctx.state.tokenData)
// - Vérifie que le titre et le contenu sont présents et non vides
// - Insère le post dans la base de données et retourne l'ID du nouveau post
export const createPost = async (ctx: RouterContext<any, any, any>) => {
  console.log("[DEBUG] postController.ts - Fonction createPost appelée");
  try {
    // Récupère le body JSON envoyé par le front
    const body = await ctx.request.body.json();
    const { title, content } = body;
    
    // Vérifie que l'utilisateur est authentifié
    if (!ctx.state.tokenData || !ctx.state.tokenData.id) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Utilisateur non authentifié ou token invalide." };
        console.log("[DEBUG] postController.ts - createPost - Erreur 401: Utilisateur non authentifié");
        return;
    }
    const userId = ctx.state.tokenData.id;

    // Vérifie que le titre et le contenu ne sont pas vides
    if (!title || title.trim() === "" || !content || content.trim() === "") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Titre et contenu sont requis et ne peuvent pas être vides." };
      console.log("[DEBUG] postController.ts - createPost - Erreur 400: Titre ou contenu manquant/vide");
      return;
    }

    // Insère le post dans la base de données
    db.query(
      "INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)",
      [userId, title, content]
    );
    
    // Récupère l'ID du nouveau post inséré
    const lastIdResult = db.query("SELECT last_insert_rowid()");
    const newPostId = (lastIdResult.length > 0 && lastIdResult[0].length > 0) ? lastIdResult[0][0] : null;

    ctx.response.status = 201; 
    ctx.response.body = { 
        message: "Post créé avec succès.", 
        postId: newPostId 
    };
    console.log(`[DEBUG] postController.ts - createPost - Post créé avec succès, ID: ${newPostId}`);

  } catch (error: any) {
    // Gestion des erreurs serveur
    console.error("[DEBUG] postController.ts - ERREUR DÉTAILLÉE dans createPost:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
        error: "Erreur lors de la création du post.", 
        details: error.message || "Aucun détail d'erreur spécifique fourni par l'objet erreur."
    };
  }
};

