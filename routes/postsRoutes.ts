import { Router } from "http://deno.land/x/oak/mod.ts";
import { createPost, getPosts } from "../controllers/postController.ts";
import { authorizationMiddleware } from "../middlewares/authMiddleware.ts";

const router = new Router();

router.get("/api/posts", getPosts);
router.post("/api/posts", authorizationMiddleware, createPost);


export default router;
