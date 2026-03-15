import Todo from "../model/todo-model.js";
import Project from "../model/project-model.js";
import ActivityLog from "../model/activity-log-model.js";
import Comment from "../model/comment-model.js";
import { createUserProfileResolver } from "../utils/user-profile-resolver.js";

// Helper to check project access
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ ownerId: userId }, { "collaborators.id": userId }],
  });
  return project;
};

const isProjectMember = (project, targetUserId) => {
  if (!targetUserId) return true;
  if (project.ownerId === targetUserId) return true;
  return (project.collaborators || []).some(
    (collaborator) => collaborator.id === targetUserId,
  );
};

const getProjectRole = (project, targetUserId) => {
  if (!targetUserId) return "";
  if (project.ownerId === targetUserId) return "Owner";
  const collaborator = (project.collaborators || []).find(
    (c) => c.id === targetUserId,
  );
  return collaborator?.role || "";
};

const hydrateTasksWithProfiles = async (tasks, project) => {
  if (!tasks || tasks.length === 0) return [];

  const { resolveProfiles, addFallback } = createUserProfileResolver();
  const userIds = [];
  const fallbacksById = {};

  tasks.forEach((taskDoc) => {
    const task = taskDoc.toObject();
    if (task.assignedTo) {
      userIds.push(task.assignedTo);
      addFallback(fallbacksById, task.assignedTo, {
        name: task.assignedToName,
        image: task.assignedToImage,
      });
    }
    if (task.createdBy) {
      userIds.push(task.createdBy);
      addFallback(fallbacksById, task.createdBy, {
        name: task.createdByName,
        image: task.createdByImage,
      });
    }
    if (task.updatedBy) {
      userIds.push(task.updatedBy);
      addFallback(fallbacksById, task.updatedBy, {
        name: task.updatedByName,
        image: task.updatedByImage,
      });
    }
  });

  const profiles = await resolveProfiles(userIds, fallbacksById);

  return tasks.map((taskDoc) => {
    const task = taskDoc.toObject();
    const assignedProfile = task.assignedTo ? profiles[task.assignedTo] : null;
    const createdProfile = task.createdBy ? profiles[task.createdBy] : null;
    const updatedProfile = task.updatedBy ? profiles[task.updatedBy] : null;
    const assignedRole =
      getProjectRole(project, task.assignedTo) || task.assignedToRole || "";

    return {
      ...task,
      assignedToName: task.assignedTo
        ? assignedProfile?.name || task.assignedToName || "Unknown User"
        : "",
      assignedToImage: task.assignedTo
        ? assignedProfile?.image || task.assignedToImage || ""
        : "",
      assignedToRole: task.assignedTo ? assignedRole : "",
      assignedToUser: assignedProfile || null,
      createdByName:
        createdProfile?.name || task.createdByName || "Unknown User",
      createdByImage: createdProfile?.image || task.createdByImage || "",
      createdByUser: createdProfile || null,
      updatedByName: task.updatedBy
        ? updatedProfile?.name || task.updatedByName || "Unknown User"
        : "",
      updatedByImage: task.updatedBy
        ? updatedProfile?.image || task.updatedByImage || ""
        : "",
      updatedByUser: updatedProfile || null,
    };
  });
};

const hydrateActivityLogsWithProfiles = async (logs) => {
  if (!logs || logs.length === 0) return [];

  const { resolveProfiles, addFallback } = createUserProfileResolver();
  const userIds = [];
  const fallbacksById = {};

  logs.forEach((logDoc) => {
    const log = logDoc.toObject();
    if (!log.userId) return;
    userIds.push(log.userId);
    addFallback(fallbacksById, log.userId, { name: log.userName });
  });

  const profiles = await resolveProfiles(userIds, fallbacksById);

  return logs.map((logDoc) => {
    const log = logDoc.toObject();
    const userProfile = log.userId ? profiles[log.userId] : null;
    return {
      ...log,
      userName: userProfile?.name || log.userName || "Unknown User",
      user: userProfile || null,
    };
  });
};

// Get all tasks in a project
export const getAllTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Check access
    const project = await checkProjectAccess(projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this project" });
    }

    const tasks = await Todo.find({ projectId }).sort({ createdAt: -1 });
    const hydratedTasks = await hydrateTasksWithProfiles(tasks, project);

    return res.status(200).json({
      success: true,
      data: hydratedTasks,
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
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Check access
    const project = await checkProjectAccess(projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this project" });
    }

    // Build query filter based on retention setting
    const retentionDays = project.activityRetentionDays ?? 30;
    const query = { projectId };
    if (retentionDays !== -1) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - retentionDays);
      query.createdAt = { $gte: cutoff };
    }

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(200);

    const hydratedLogs = await hydrateActivityLogsWithProfiles(logs);

    return res.status(200).json({
      success: true,
      data: hydratedLogs,
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
      return res.status(400).json({ message: "Please provide a task id" });
    }

    const task = await Todo.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check project access
    const project = await checkProjectAccess(task.projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this task" });
    }

    const [hydratedTask] = await hydrateTasksWithProfiles([task], project);

    return res.status(200).json({
      success: true,
      data: hydratedTask,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// Add task to project
export const addTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      taskType,
      startDate,
      dueDate,
      projectId,
      assignedTo,
    } = req.body;
    const userId = req.userId;

    if (!title) {
      return res.status(400).json({ message: "Please provide a task title" });
    }

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Check access
    const project = await checkProjectAccess(projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this project" });
    }

    if (assignedTo && !isProjectMember(project, assignedTo)) {
      return res
        .status(400)
        .json({ message: "Assignee must be a member of this project" });
    }

    const newTask = await Todo.create({
      title,
      description: description || "",
      status: status || "pending",
      priority: priority || "medium",
      taskType: taskType || "feature",
      startDate: startDate || null,
      dueDate: dueDate || null,
      projectId,
      assignedTo: assignedTo || "",
      createdBy: userId,
    });

    // Build snapshot with optional dates
    const duePart = dueDate
      ? `, due ${new Date(dueDate).toLocaleDateString()}`
      : "";
    const typePart = taskType ? ` [${taskType}]` : "";

    // Log the activity
    await ActivityLog.create({
      projectId,
      userId,
      action: "CREATED_TASK",
      taskSnapshot: `${typePart} Task "${title}" created with status "${status || "pending"}" and priority "${priority || "medium"}"${duePart}.`,
    });

    const [hydratedTask] = await hydrateTasksWithProfiles([newTask], project);

    return res.status(201).json({
      success: true,
      message: "Task added successfully",
      data: hydratedTask,
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
    const {
      title,
      description,
      status,
      priority,
      taskType,
      startDate,
      dueDate,
      assignedTo,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Please provide a task id" });
    }

    const task = await Todo.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check project access
    const project = await checkProjectAccess(task.projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this task" });
    }

    if (
      assignedTo !== undefined &&
      assignedTo &&
      !isProjectMember(project, assignedTo)
    ) {
      return res
        .status(400)
        .json({ message: "Assignee must be a member of this project" });
    }

    // Create update object dynamically so we don't clear assignment fields if they are not passed
    const updateFields = { updatedBy: userId };
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;
    if (taskType !== undefined) updateFields.taskType = taskType;
    if (startDate !== undefined) updateFields.startDate = startDate || null;
    if (dueDate !== undefined) updateFields.dueDate = dueDate || null;
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;

    const updatedTask = await Todo.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    // Determine action type
    let action = "UPDATED_TASK";
    if (status !== undefined && task.status !== status) {
      action = "UPDATED_STATUS";
    }

    const nextTitle = title !== undefined ? title : task.title;
    const statusTransition =
      action === "UPDATED_STATUS"
        ? ` from status "${task.status}" to "${status}"`
        : "";
    const nextType = taskType !== undefined ? taskType : task.taskType;
    const typePart = nextType ? ` [${nextType}]` : "";

    // Log the activity
    await ActivityLog.create({
      projectId: task.projectId,
      userId,
      action,
      taskSnapshot: `${typePart} Task "${nextTitle}" updated${statusTransition}.`,
    });

    const [hydratedTask] = await hydrateTasksWithProfiles(
      [updatedTask],
      project,
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: hydratedTask,
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
      return res.status(400).json({ message: "Please provide a task id" });
    }

    const task = await Todo.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check project access
    const project = await checkProjectAccess(task.projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this task" });
    }

    // Delete associated comments
    await Comment.deleteMany({ taskId: id });

    await Todo.findByIdAndDelete(id);

    // Log the activity
    await ActivityLog.create({
      projectId: task.projectId,
      userId,
      action: "DELETED_TASK",
      taskSnapshot: `Task "${task.title}" deleted.`,
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
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
      return res.status(400).json({ message: "Project ID is required" });
    }

    if (!search) {
      return res.status(400).json({ message: "Please provide a search term" });
    }

    // Check access
    const project = await checkProjectAccess(projectId, userId);
    if (!project) {
      return res
        .status(403)
        .json({ message: "You do not have access to this project" });
    }

    const tasks = await Todo.find({
      projectId,
      title: { $regex: search, $options: "i" },
    });

    const hydratedTasks = await hydrateTasksWithProfiles(tasks, project);

    return res.status(200).json({
      success: true,
      data: hydratedTasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
