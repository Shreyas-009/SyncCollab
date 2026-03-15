import Comment from "../model/comment-model.js";
import Todo from "../model/todo-model.js";
import Project from "../model/project-model.js";
import { createUserProfileResolver } from "../utils/user-profile-resolver.js";

// Helper to check project access
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ ownerId: userId }, { "collaborators.id": userId }],
  });
  return project;
};

// Get all comments for a task
export const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    // Verify task exists and user has access
    const task = await Todo.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await checkProjectAccess(task.projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this task" });
    }

    const comments = await Comment.find({ taskId }).sort({ createdAt: 1 });

    // Hydrate with user profiles
    const { resolveProfiles, addFallback } = createUserProfileResolver();
    const userIds = comments.map((c) => c.userId);
    const fallbacksById = {};

    comments.forEach((comment) => {
      addFallback(fallbacksById, comment.userId, { name: "", image: "" });
    });

    const profiles = await resolveProfiles(userIds, fallbacksById);

    const hydratedComments = comments.map((comment) => ({
      ...comment.toObject(),
      userName: profiles[comment.userId]?.name || "Unknown User",
      userImage: profiles[comment.userId]?.image || "",
    }));

    return res.status(200).json({
      success: true,
      data: hydratedComments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { commentText } = req.body;
    const userId = req.userId;

    if (!taskId || !commentText || !commentText.trim()) {
      return res
        .status(400)
        .json({ message: "Task ID and comment text are required" });
    }

    // Verify task exists and user has access
    const task = await Todo.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await checkProjectAccess(task.projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this task" });
    }

    const newComment = new Comment({
      taskId,
      userId,
      commentText: commentText.trim(),
    });

    await newComment.save();

    // Hydrate with user profile
    const { resolveProfiles } = createUserProfileResolver();
    const profiles = await resolveProfiles([userId], {});
    const userName = profiles[userId]?.name || "Unknown User";
    const userImage = profiles[userId]?.image || "";

    return res.status(201).json({
      success: true,
      data: {
        ...newComment.toObject(),
        userName,
        userImage,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentText } = req.body;
    const userId = req.userId;

    if (!id || !commentText || !commentText.trim()) {
      return res
        .status(400)
        .json({ message: "Comment ID and text are required" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only allow author to edit
    if (comment.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" });
    }

    comment.commentText = commentText.trim();
    await comment.save();

    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id) {
      return res.status(400).json({ message: "Comment ID is required" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only allow author to delete
    if (comment.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
