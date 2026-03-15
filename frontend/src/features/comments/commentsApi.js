import { apiClient } from "../../utils/api.js";

// Fetch comments for a task
export const fetchComments = async (taskId) => {
  try {
    const response = await apiClient.get(`/comments/${taskId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// Create a new comment
export const createComment = async (taskId, commentText) => {
  try {
    const response = await apiClient.post(`/comments/${taskId}`, {
      commentText,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (commentId, commentText) => {
  try {
    const response = await apiClient.patch(`/comments/${commentId}`, {
      commentText,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
