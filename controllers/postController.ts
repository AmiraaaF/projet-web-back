import { RouterContext } from "http://deno.land/x/oak@v17.1.4/mod.ts";
import { db } from "../models/db.ts";

// Récupérer tous les posts
export const getPosts = (ctx: RouterContext<any, any, any>) => {
  
  try {
    const postsResult = db.query(
      "SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.username as author_username, u.role as author_role FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC"
    );
    
    // Récupérer le rôle de l'utilisateur actuel s'il est connecté
    let currentUserRole = null;
    if (ctx.state.tokenData) {
      const userResult = db.query("SELECT role FROM users WHERE id = ?", [ctx.state.tokenData.id]);
      if (userResult.length > 0) {
        currentUserRole = userResult[0][0];
      }
    }

    // Transformer les résultats de la requête en un format plus utilisable
    const posts = postsResult.map((row: any) => {
      return {
        id: row[0],
        title: row[1],
        content: row[2],
        created_at: row[3],
        updated_at: row[4],
        author_username: row[5],
        author_role: row[6],
        current_user_role: currentUserRole
      };
    });
    ctx.response.body = posts;
  } catch (error: any) {
    console.error("[DEBUG] postController.ts - ERREUR DÉTAILLÉE dans getPosts:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
        error: "Erreur lors de la récupération des posts.", 
        details: error.message || "Aucun détail d'erreur spécifique fourni par l'objet erreur."
    };
  }
};

// Créer un nouveau post
export const createPost = async (ctx: RouterContext<any, any, any>) => {
  console.log("[DEBUG] postController.ts - Fonction createPost appelée");
  try {
    const body = await ctx.request.body.json();
    const { title, content } = body;
    
    if (!ctx.state.tokenData || !ctx.state.tokenData.id) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Utilisateur non authentifié ou token invalide." };
        console.log("[DEBUG] postController.ts - createPost - Erreur 401: Utilisateur non authentifié");
        return;
    }
    const userId = ctx.state.tokenData.id;

    if (!title || title.trim() === "" || !content || content.trim() === "") {
      ctx.response.status = 400;
      ctx.response.body = { error: "Titre et contenu sont requis et ne peuvent pas être vides." };
      console.log("[DEBUG] postController.ts - createPost - Erreur 400: Titre ou contenu manquant/vide");
      return;
    }

    db.query(
      "INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)",
      [userId, title, content]
    );
    
    const lastIdResult = db.query("SELECT last_insert_rowid()");
    const newPostId = (lastIdResult.length > 0 && lastIdResult[0].length > 0) ? lastIdResult[0][0] : null;

    ctx.response.status = 201; 
    ctx.response.body = { 
        message: "Post créé avec succès.", 
        postId: newPostId 
        
    };
    console.log(`[DEBUG] postController.ts - createPost - Post créé avec succès, ID: ${newPostId}`);

  } catch (error: any) {
    console.error("[DEBUG] postController.ts - ERREUR DÉTAILLÉE dans createPost:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
        error: "Erreur lors de la création du post.", 
        details: error.message || "Aucun détail d'erreur spécifique fourni par l'objet erreur."
    };''
  }
};

