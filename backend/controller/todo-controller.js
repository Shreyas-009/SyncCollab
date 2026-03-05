import Todo from '../model/todo-model.js';
import Project from '../model/project-model.js';

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
        const { title, description, status, priority, projectId, createdByName, createdByImage } = req.body;
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
            createdBy: userId,
            createdByName: createdByName || '',
            createdByImage: createdByImage || ''
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
        const { title, description, status, priority, updatedBy, updatedByName, updatedByImage } = req.body;

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

        const updatedTask = await Todo.findByIdAndUpdate(
            id,
            {
                title,
                description,
                status,
                priority,
                updatedBy: updatedBy || userId,
                updatedByName: updatedByName || '',
                updatedByImage: updatedByImage || ''
            },
            { new: true }
        );

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