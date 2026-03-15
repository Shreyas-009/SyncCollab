import express from "express";
import {
  getCommentsByTask,
  createComment,
  updateComment,
  deleteComment,
} from "../controller/comment-controller.js";
import { requireAuth } from "../middleware/clerk-auth.js";

const router = express.Router();

// All comment routes require authentication
router.use(requireAuth);

// Get comments for a task
router.get("/comments/:taskId", getCommentsByTask);

// Create a comment
router.post("/comments/:taskId", createComment);

// Update a comment
router.patch("/comments/:id", updateComment);

// Delete a comment
router.delete("/comments/:id", deleteComment);

export default router;
