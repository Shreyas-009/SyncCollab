import Todo from '../model/todo-model.js';
import Project from '../model/project-model.js';
import ActivityLog from '../model/activity-log-model.js';

// Helper to check project access
const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findOne({
        _id: projectId,
        $or: [
            { ownerId: userId },
            { 'collaborators.id': userId }
        ]
    });
    return project;
};

// Get all tasks in a project
export const getAllTasks = async (req, res) => {
    try {
        const userId = req.userId;
        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        // Check access
        const project = await checkProjectAccess(projectId, userId);
        if (!project) {
            return res.status(403).json({ message: 'You do not have access to this project' });
        }

        const tasks = await Todo.find({ projectId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Get activity logs for a project
export const getActivityLogs = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        // Check access
        const project = await checkProjectAccess(projectId, userId);
        if (!project) {
            return res.status(403).json({ message: 'You do not have access to this project' });
        }

        const logs = await ActivityLog.find({ projectId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 activities for performance

        return res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Get single task
export const getSignleTasks = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;

        if (!id) {
            return res.status(400).json({ message: 'Please provide a task id' });
        }

        const task = await Todo.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check project access
        const project = await checkProjectAccess(task.projectId, userId);
        if (!project) {
            return res.status(403).json({ message: 'You do not have access to this task' });
        }

        return res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Add task to project
export const addTask = async (req, res) => {
    try {
        const { title, description, status, priority, projectId, createdByName, createdByImage, assignedTo, assignedToName, assignedToImage, assignedToRole } = req.body;
        const userId = req.userId;

        if (!title) {
            return res.status(400).json({ message: 'Please provide a task title' });
        }

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        // Check access
        const project = await checkProjectAccess(projectId, userId);
        if (!project) {
            return res.status(403).json({ message: 'You do not have access to this project' });
        }

        const newTask = await Todo.create({
            title,
            description: description || '',
            status: status || 'pending',
            priority: priority || 'medium',
            projectId,
            assignedTo: assignedTo || '',
            assignedToName: assignedToName || '',
            assignedToImage: assignedToImage || '',
            assignedToRole: assignedToRole || '',
            createdBy: userId,
            createdByName: createdByName || '',
            createdByImage: createdByImage || ''
        });

        // Log the activity
        await ActivityLog.create({
            projectId,
            userId,
            userName: createdByName || 'Unknown User',
            action: 'CREATED_TASK',
            taskSnapshot: `Task "${title}" created with status "${status || 'pending'}" and priority "${priority || 'medium'}".`
        });

        return res.status(201).json({
            success: true,
            message: 'Task added successfully',
            data: newTask
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Update task
export const updateTask = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const { title, description, status, priority, updatedBy, updatedByName, updatedByImage, assignedTo, assignedToName, assignedToImage, assignedToRole } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Please provide a task id' });
        }

        const task = await Todo.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check project access
        const project = await checkProjectAccess(task.projectId, userId);
        if (!project) {
            return res.status(403).json({ message: 'You do not have access to this task' });
        }

        // Create update object dynamically so we don't clear assignment fields if they are not passed
        const updateFields = {
            title,
            description,
            status,
            priority,
            updatedBy: updatedBy || userId,
            updatedByName: updatedByName || '',
            updatedByImage: updatedByImage || ''
        };

        if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
        if (assignedToName !== undefined) updateFields.assignedToName = assignedToName;
        if (assignedToImage !== undefined) updateFields.assignedToImage = assignedToImage;
        if (assignedToRole !== undefined) updateFields.assignedToRole = assignedToRole;

        const updatedTask = await Todo.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );

        // Determine action type
        let action = 'UPDATED_TASK';
        if (task.status !== status) {
            action = 'UPDATED_STATUS';
        }

        // Log the activity
        await ActivityLog.create({
            projectId: task.projectId,
            userId,
            userName: updatedByName || 'Unknown User',
            action,
            taskSnapshot: `Task "${title || task.title}" updated${action === 'UPDATED_STATUS' ? ` from status "${task.status}" to "${status}"` : ''}.`
        });

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Delete task
export const deleteTask = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;

        if (!id) {
            return res.status(400).json({ message: 'Please provide a task id' });
        }

        const task = await Todo.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check project access
        const project = await checkProjectAccess(task.projectId, userId);
        if (!project) {
            return res.status(403).json({ message: 'You do not have access to this task' });
        }

        await Todo.findByIdAndDelete(id);

        // Log the activity
        await ActivityLog.create({
            projectId: task.projectId,
            userId,
            userName: 'User', // We don't have the user's name in this request easily without fetching it, so generic User
            action: 'DELETED_TASK',
            taskSnapshot: `Task "${task.title}" deleted.`
        });

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Search tasks in a project
export const getTasksBySearch = async (req, res) => {
    try {
        const { search, projectId } = req.query;
        const userId = req.userId;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        if (!search) {
            return res.status(400).json({ message: 'Please provide a search term' });
        }

        // Check access
        const project = await checkProjectAccess(projectId, userId);
        if (!project) {
            return res.status(403).json({ message: 'You do not have access to this project' });
        }

        const tasks = await Todo.find({
            projectId,
            title: { $regex: search, $options: 'i' }
        });

        return res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};