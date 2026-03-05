import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with auth interceptor
const apiClient = axios.create({
    baseURL: API_URL
});

// Function to set auth headers - will be called from components
let getAuthToken = null;
let getUserId = null;

export const setAuthFunctions = (tokenFn, userIdFn) => {
    getAuthToken = tokenFn;
    getUserId = userIdFn;
};

// Add auth header to all requests
apiClient.interceptors.request.use(async (config) => {
    if (getAuthToken) {
        try {
            const token = await getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('Could not get auth token', e);
        }
    }
    if (getUserId) {
        const userId = getUserId();
        if (userId) {
            config.headers['x-user-id'] = userId;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ============ PROJECT API ============

export const fetchProjects = async () => {
    try {
        const response = await apiClient.get('/projects');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
    }
};

export const createProject = async (project) => {
    try {
        const response = await apiClient.post('/projects', project);
        return response.data.data;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
};

export const updateProject = async (projectId, data) => {
    try {
        const response = await apiClient.patch(`/projects/${projectId}`, data);
        return response.data.data;
    } catch (error) {
        console.error("Error updating project:", error);
        throw error;
    }
};

export const deleteProject = async (projectId) => {
    try {
        const response = await apiClient.delete(`/projects/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
};

export const addProjectCollaborator = async (projectId, collaborator) => {
    try {
        const response = await apiClient.post(`/projects/${projectId}/collaborators`, collaborator);
        return response.data.data;
    } catch (error) {
        console.error("Error adding collaborator:", error);
        throw error;
    }
};

export const removeProjectCollaborator = async (projectId, collaboratorId) => {
    try {
        const response = await apiClient.delete(`/projects/${projectId}/collaborators`, {
            data: { collaboratorId }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error removing collaborator:", error);
        throw error;
    }
};

export const leaveProject = async (projectId) => {
    try {
        const response = await apiClient.post(`/projects/${projectId}/leave`);
        return response.data;
    } catch (error) {
        console.error("Error leaving project:", error);
        throw error;
    }
};

// ============ TASK API ============

export const fetchTasks = async (projectId) => {
    try {
        const response = await apiClient.get(`/todos?projectId=${projectId}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching Tasks:", error);
        throw error;
    }
};

export const addTask = async (task) => {
    try {
        const response = await apiClient.post('/todos', task);
        return response.data.data;
    } catch (error) {
        console.error("Error adding Task:", error);
        throw error;
    }
};

export const deleteTask = async (id) => {
    try {
        const response = await apiClient.delete(`/todos/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting Task:", error);
        throw error;
    }
};

export const updateTask = async (id, updateData) => {
    try {
        const response = await apiClient.patch(`/todos/${id}`, updateData);
        return response.data.data;
    } catch (error) {
        console.error("Error updating Task:", error);
        throw error;
    }
};

export const searchTasks = async (query, projectId) => {
    try {
        const response = await apiClient.get(`/todos/search?search=${query}&projectId=${projectId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error searching tasks:', error);
        throw error;
    }
};

// ============ USER API ============

export const sendInvitation = async (email) => {
    try {
        const response = await apiClient.post('/invite', { email });
        return response.data;
    } catch (error) {
        console.error('Error sending invitation:', error);
        throw error;
    }
};

export const searchUsers = async (email) => {
    try {
        const response = await apiClient.get(`/users/search?email=${encodeURIComponent(email)}`);
        return response.data.data;
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
};

// ============ PROJECT INVITE API ============

export const sendProjectInvite = async (data) => {
    try {
        const response = await apiClient.post('/invites', data);
        return response.data;
    } catch (error) {
        console.error('Error sending invite:', error);
        throw error;
    }
};

export const getPendingInvites = async () => {
    try {
        const response = await apiClient.get('/invites/pending');
        return response.data.data;
    } catch (error) {
        console.error('Error getting invites:', error);
        throw error;
    }
};

export const acceptInvite = async (inviteId, userData) => {
    try {
        const response = await apiClient.post(`/invites/${inviteId}/accept`, userData);
        return response.data;
    } catch (error) {
        console.error('Error accepting invite:', error);
        throw error;
    }
};

export const declineInvite = async (inviteId) => {
    try {
        const response = await apiClient.post(`/invites/${inviteId}/decline`);
        return response.data;
    } catch (error) {
        console.error('Error declining invite:', error);
        throw error;
    }
};

// ============ INVITE LINK API ============

export const createInviteLink = async (projectId, createdByName) => {
    try {
        const response = await apiClient.post('/invites/link', { projectId, createdByName });
        return response.data;
    } catch (error) {
        console.error('Error creating invite link:', error);
        throw error;
    }
};

export const getInviteLinkInfo = async (token) => {
    try {
        const response = await apiClient.get(`/invites/link/${token}`);
        return response.data;
    } catch (error) {
        console.error('Error getting invite link info:', error);
        throw error;
    }
};

export const acceptInviteLink = async (token, userData) => {
    try {
        const response = await apiClient.post(`/invites/link/${token}/accept`, userData);
        return response.data;
    } catch (error) {
        console.error('Error accepting invite link:', error);
        throw error;
    }
};