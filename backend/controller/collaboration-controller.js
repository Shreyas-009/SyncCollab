import CollaborationRequest from '../model/collaboration-request-model.js';
import Todo from '../model/todo-model.js';

// Send collaboration request
export const sendCollaborationRequest = async (req, res) => {
    try {
        const { taskId, toUserId, toUserEmail, fromUserEmail, fromUserName, fromUserImage } = req.body;
        const fromUserId = req.userId;

        if (!taskId || !toUserId || !toUserEmail) {
            return res.status(400).json({ message: 'Task ID, recipient ID and email are required' });
        }

        // Check if task exists and user is owner
        const task = await Todo.findOne({ _id: taskId, userId: fromUserId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or you are not the owner' });
        }

        // Check if already a collaborator
        if (task.collaborators.some(c => c.id === toUserId)) {
            return res.status(400).json({ message: 'User is already a collaborator' });
        }

        // Check if request already exists
        const existingRequest = await CollaborationRequest.findOne({
            taskId,
            toUserId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'A pending request already exists for this user' });
        }

        // Create collaboration request
        const request = await CollaborationRequest.create({
            taskId,
            fromUserId,
            fromUserEmail: fromUserEmail || '',
            fromUserName: fromUserName || '',
            fromUserImage: fromUserImage || '',
            toUserId,
            toUserEmail,
            taskTitle: task.title
        });

        return res.status(201).json({
            success: true,
            message: 'Collaboration request sent',
            data: request
        });
    } catch (error) {
        console.error('Send collaboration request error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Get pending requests for current user
export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.userId;

        const requests = await CollaborationRequest.find({
            toUserId: userId,
            status: 'pending'
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Accept collaboration request
export const acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.userId;
        const { userEmail, userName, userImage } = req.body;

        console.log('Accept request - userId:', userId, 'requestId:', requestId);

        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in request' });
        }

        // First find by ID only to see what's in the db
        const requestById = await CollaborationRequest.findById(requestId);
        console.log('Request found by ID:', requestById ? {
            _id: requestById._id,
            toUserId: requestById.toUserId,
            fromUserId: requestById.fromUserId,
            status: requestById.status
        } : 'NOT FOUND');

        if (!requestById) {
            return res.status(404).json({ message: 'Request not found by ID' });
        }

        if (requestById.toUserId !== userId) {
            console.log('User ID mismatch - request.toUserId:', requestById.toUserId, 'current userId:', userId);
            return res.status(403).json({ message: 'This request is not for you' });
        }

        if (requestById.status !== 'pending') {
            return res.status(400).json({ message: 'Request is no longer pending' });
        }

        // Add user to task collaborators FIRST (before updating status)
        const task = await Todo.findById(requestById.taskId);
        if (task) {
            const collaboratorId = requestById.toUserId;
            console.log('Adding collaborator with id:', collaboratorId);

            if (!collaboratorId) {
                return res.status(500).json({ message: 'Collaborator ID is missing from request' });
            }

            // Use findByIdAndUpdate with $push to avoid validation issues
            await Todo.findByIdAndUpdate(
                requestById.taskId,
                {
                    $push: {
                        collaborators: {
                            id: collaboratorId,
                            email: userEmail || requestById.toUserEmail || '',
                            name: userName || '',
                            image: userImage || ''
                        }
                    }
                }
            );
        }

        // Update request status ONLY after successful collaborator add
        requestById.status = 'accepted';
        await requestById.save();

        return res.status(200).json({
            success: true,
            message: 'Collaboration request accepted',
            data: requestById
        });
    } catch (error) {
        console.error('Accept request error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Decline collaboration request
export const declineRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.userId;

        const request = await CollaborationRequest.findOne({
            _id: requestId,
            toUserId: userId,
            status: 'pending'
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = 'declined';
        await request.save();

        return res.status(200).json({
            success: true,
            message: 'Collaboration request declined'
        });
    } catch (error) {
        console.error('Decline request error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Get sent requests (for the sender to track)
export const getSentRequests = async (req, res) => {
    try {
        const userId = req.userId;

        const requests = await CollaborationRequest.find({
            fromUserId: userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get sent requests error:', error);
        return res.status(500).json({ message: error.message });
    }
};
