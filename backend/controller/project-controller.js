import Project from '../model/project-model.js';
import Todo from '../model/todo-model.js';
import ActivityLog from '../model/activity-log-model.js';
import { createUserProfileResolver } from '../utils/user-profile-resolver.js';

const hydrateProjectsWithProfiles = async (projects) => {
    if (!projects || projects.length === 0) return [];

    const { resolveProfiles, addFallback } = createUserProfileResolver();
    const userIds = [];
    const fallbacksById = {};

    projects.forEach((projectDoc) => {
        const project = projectDoc.toObject();
        if (project.ownerId) {
            userIds.push(project.ownerId);
            addFallback(fallbacksById, project.ownerId, {
                name: project.ownerName,
                image: project.ownerImage,
                email: project.ownerEmail
            });
        }

        (project.collaborators || []).forEach((collaborator) => {
            if (!collaborator.id) return;
            userIds.push(collaborator.id);
            addFallback(fallbacksById, collaborator.id, {
                name: collaborator.name,
                image: collaborator.image,
                email: collaborator.email
            });
        });
    });

    const profiles = await resolveProfiles(userIds, fallbacksById);

    return projects.map((projectDoc) => {
        const project = projectDoc.toObject();
        const ownerProfile = profiles[project.ownerId];

        return {
            ...project,
            ownerName: ownerProfile?.name || project.ownerName || 'Unknown User',
            ownerImage: ownerProfile?.image || project.ownerImage || '',
            ownerEmail: ownerProfile?.email || project.ownerEmail || '',
            owner: ownerProfile || null,
            collaborators: (project.collaborators || []).map((collaborator) => {
                const profile = profiles[collaborator.id];
                return {
                    ...collaborator,
                    name: profile?.name || collaborator.name || collaborator.email || 'Unknown User',
                    image: profile?.image || collaborator.image || '',
                    email: profile?.email || collaborator.email || '',
                    user: profile || null
                };
            })
        };
    });
};

const hydrateProjectWithProfiles = async (project) => {
    if (!project) return null;
    const [hydratedProject] = await hydrateProjectsWithProfiles([project]);
    return hydratedProject;
};

// Create new project
export const createProject = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const ownerId = req.userId;

        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = await Project.create({
            name,
            description: description || '',
            ownerId,
            color: color || '#8B5CF6',
            collaborators: []
        });

        // Log the activity
        await ActivityLog.create({
            projectId: project._id,
            userId: ownerId,
            action: 'PROJECT_CREATED',
            taskSnapshot: `Project "${name}" created.`
        });

        const hydratedProject = await hydrateProjectWithProfiles(project);

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: hydratedProject
        });
    } catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Get all projects (owned + collaborating)
export const getProjects = async (req, res) => {
    try {
        const userId = req.userId;

        const projects = await Project.find({
            $or: [
                { ownerId: userId },
                { 'collaborators.id': userId }
            ]
        }).sort({ createdAt: -1 });

        const hydratedProjects = await hydrateProjectsWithProfiles(projects);

        return res.status(200).json({
            success: true,
            data: hydratedProjects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Get single project
export const getProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { ownerId: userId },
                { 'collaborators.id': userId }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const hydratedProject = await hydrateProjectWithProfiles(project);

        return res.status(200).json({
            success: true,
            data: hydratedProject
        });
    } catch (error) {
        console.error('Get project error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Update project
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;
        const { name, description, color, activityRetentionDays } = req.body;

        const validRetentionValues = [30, 60, 90, -1];
        const updateData = { name, description, color };
        if (activityRetentionDays !== undefined) {
            if (!validRetentionValues.includes(Number(activityRetentionDays))) {
                return res.status(400).json({ message: 'Invalid activity retention value. Must be 30, 60, 90, or -1 (never).' });
            }
            updateData.activityRetentionDays = Number(activityRetentionDays);
        }

        // Only owner can update project
        const project = await Project.findOneAndUpdate(
            { _id: projectId, ownerId: userId },
            updateData,
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not the owner' });
        }

        const hydratedProject = await hydrateProjectWithProfiles(project);

        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: hydratedProject
        });
    } catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Delete project (and all its todos)
export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;

        // Only owner can delete
        const project = await Project.findOneAndDelete({ _id: projectId, ownerId: userId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not the owner' });
        }

        // Delete all todos in this project
        await Todo.deleteMany({ projectId });

        return res.status(200).json({
            success: true,
            message: 'Project and all its todos deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Add collaborator to project
export const addCollaborator = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { collaboratorId } = req.body;
        const userId = req.userId;

        if (!collaboratorId) {
            return res.status(400).json({ message: 'Collaborator ID is required' });
        }

        // Only owner can add collaborators
        const project = await Project.findOne({ _id: projectId, ownerId: userId });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not the owner' });
        }

        // Check if already a collaborator
        if (project.collaborators.some(c => c.id === collaboratorId)) {
            return res.status(400).json({ message: 'User is already a collaborator' });
        }

        if (project.ownerId === collaboratorId) {
            return res.status(400).json({ message: 'Project owner is already in the project' });
        }

        await Project.findByIdAndUpdate(projectId, {
            $push: {
                collaborators: {
                    id: collaboratorId
                }
            }
        });

        const updatedProject = await Project.findById(projectId);
        const hydratedProject = await hydrateProjectWithProfiles(updatedProject);

        return res.status(200).json({
            success: true,
            message: 'Collaborator added successfully',
            data: hydratedProject
        });
    } catch (error) {
        console.error('Add collaborator error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Remove collaborator from project
export const removeCollaborator = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { collaboratorId } = req.body;
        const userId = req.userId;

        if (!collaboratorId) {
            return res.status(400).json({ message: 'Collaborator ID is required' });
        }

        // Only owner can remove collaborators
        const project = await Project.findOne({ _id: projectId, ownerId: userId });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not the owner' });
        }

        await Project.findByIdAndUpdate(projectId, {
            $pull: {
                collaborators: { id: collaboratorId }
            }
        });

        // Log the activity
        await ActivityLog.create({
            projectId,
            userId,
            action: 'MEMBER_REMOVED',
            taskSnapshot: `Member removed from the project.`
        });

        const updatedProject = await Project.findById(projectId);
        const hydratedProject = await hydrateProjectWithProfiles(updatedProject);

        return res.status(200).json({
            success: true,
            message: 'Collaborator removed successfully',
            data: hydratedProject
        });
    } catch (error) {
        console.error('Remove collaborator error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Leave project (for collaborators)
export const leaveProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;

        // Check if user is a collaborator (not owner)
        const project = await Project.findOne({
            _id: projectId,
            'collaborators.id': userId
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not a collaborator' });
        }

        // Cannot leave if you're the owner
        if (project.ownerId === userId) {
            return res.status(400).json({ message: 'Owners cannot leave their own projects. Delete the project instead.' });
        }

        await Project.findByIdAndUpdate(projectId, {
            $pull: {
                collaborators: { id: userId }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'You have left the project'
        });
    } catch (error) {
        console.error('Leave project error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Update collaborator role
export const updateCollaboratorRole = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { collaboratorId, role } = req.body;
        const userId = req.userId;

        if (!collaboratorId || !role) {
            return res.status(400).json({ message: 'Collaborator ID and Role are required' });
        }

        const validRoles = ['Team Lead', 'Frontend Developer', 'Backend Developer', 'Tester', 'Designer', 'Member'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        // Only owner can update roles
        const project = await Project.findOne({ _id: projectId, ownerId: userId });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not the owner' });
        }

        // Update the specific collaborator's role
        await Project.updateOne(
            { _id: projectId, 'collaborators.id': collaboratorId },
            { $set: { 'collaborators.$.role': role } }
        );

        // Log the activity
        await ActivityLog.create({
            projectId,
            userId,
            action: 'ROLE_UPDATED',
            taskSnapshot: `Member role updated to "${role}".`
        });

        const updatedProject = await Project.findById(projectId);
        const hydratedProject = await hydrateProjectWithProfiles(updatedProject);

        return res.status(200).json({
            success: true,
            message: 'Collaborator role updated successfully',
            data: hydratedProject
        });
    } catch (error) {
        console.error('Update role error:', error);
        return res.status(500).json({ message: error.message });
    }
};
