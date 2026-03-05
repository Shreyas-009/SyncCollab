import express from 'express';
import { getAllTasks, addTask, getSignleTasks, updateTask, deleteTask, getTasksBySearch } from '../controller/todo-controller.js';
import { createProject, getProjects, getProject, updateProject, deleteProject, removeCollaborator, leaveProject } from '../controller/project-controller.js';
import { sendProjectInvite, getPendingInvites, acceptInvite, declineInvite, createInviteLink, getInviteLinkInfo, acceptInviteLink } from '../controller/project-invite-controller.js';
import { requireAuth, sendInvitation, searchUsers } from '../middleware/clerk-auth.js';

const router = express.Router();

// Public route - get invite link info (no auth required)
router.get('/invites/link/:token', getInviteLinkInfo);

// All routes below require authentication
router.use(requireAuth);

// Project routes
router.get('/projects', getProjects);
router.post('/projects', createProject);
router.get('/projects/:projectId', getProject);
router.patch('/projects/:projectId', updateProject);
router.delete('/projects/:projectId', deleteProject);
router.delete('/projects/:projectId/collaborators', removeCollaborator);
router.post('/projects/:projectId/leave', leaveProject);

// Project invite routes
router.post('/invites', sendProjectInvite);
router.get('/invites/pending', getPendingInvites);
router.post('/invites/:inviteId/accept', acceptInvite);
router.post('/invites/:inviteId/decline', declineInvite);

// Invite link routes
router.post('/invites/link', createInviteLink);
router.post('/invites/link/:token/accept', acceptInviteLink);

// Todo routes
router.get('/todos', getAllTasks);
router.post('/todos', addTask);
router.get('/todos/search', getTasksBySearch);
router.get('/todos/:id', getSignleTasks);
router.patch('/todos/:id', updateTask);
router.delete('/todos/:id', deleteTask);

// User routes
router.get('/users/search', searchUsers);
router.post('/invite', sendInvitation);


export default router;