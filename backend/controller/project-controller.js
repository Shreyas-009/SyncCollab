import Project from '../model/project-model.js';
import Todo from '../model/todo-model.js';

// Create new project
export const createProject = async (req, res) => {
    try {
        const { name, description, color, ownerEmail, ownerName, ownerImage } = req.body;
        const ownerId = req.userId;

        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = await Project.create({
            name,
            description: description || '',
            ownerId,
            ownerEmail: ownerEmail || '',
            ownerName: ownerName || '',
            ownerImage: ownerImage || '',
            color: color || '#8B5CF6',
            collaborators: []
        });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project
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

        return res.status(200).json({
            success: true,
            data: projects
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

        return res.status(200).json({
            success: true,
            data: project
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
        const { name, description, color } = req.body;

        // Only owner can update project
        const project = await Project.findOneAndUpdate(
            { _id: projectId, ownerId: userId },
            { name, description, color },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not the owner' });
        }

        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project
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
        const { collaboratorId, email, name, image } = req.body;
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

        await Project.findByIdAndUpdate(projectId, {
            $push: {
                collaborators: {
                    id: collaboratorId,
                    email: email || '',
                    name: name || '',
                    image: image || ''
                }
            }
        });

        const updatedProject = await Project.findById(projectId);

        return res.status(200).json({
            success: true,
            message: 'Collaborator added successfully',
            data: updatedProject
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

        const updatedProject = await Project.findById(projectId);

        return res.status(200).json({
            success: true,
            message: 'Collaborator removed successfully',
            data: updatedProject
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
