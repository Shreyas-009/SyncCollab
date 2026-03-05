import ProjectInvite from '../model/project-invite-model.js';
import ProjectInviteLink from '../model/project-invite-link-model.js';
import Project from '../model/project-model.js';

// Send project invite
export const sendProjectInvite = async (req, res) => {
    try {
        const { projectId, toUserId, toUserEmail, fromUserEmail, fromUserName, fromUserImage } = req.body;
        const fromUserId = req.userId;

        if (!projectId || !toUserId || !toUserEmail) {
            return res.status(400).json({ message: 'Project ID, recipient ID and email are required' });
        }

        // Check if project exists and user is owner
        const project = await Project.findOne({ _id: projectId, ownerId: fromUserId });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you are not the owner' });
        }

        // Check if already a collaborator
        if (project.collaborators.some(c => c.id === toUserId)) {
            return res.status(400).json({ message: 'User is already a collaborator' });
        }

        // Check if invite already exists
        const existingInvite = await ProjectInvite.findOne({
            projectId,
            toUserId,
            status: 'pending'
        });

        if (existingInvite) {
            return res.status(400).json({ message: 'An invite is already pending for this user' });
        }

        // Create invite
        const invite = await ProjectInvite.create({
            projectId,
            projectName: project.name,
            projectColor: project.color,
            fromUserId,
            fromUserEmail: fromUserEmail || '',
            fromUserName: fromUserName || '',
            fromUserImage: fromUserImage || '',
            toUserId,
            toUserEmail
        });

        return res.status(201).json({
            success: true,
            message: 'Invite sent',
            data: invite
        });
    } catch (error) {
        console.error('Send invite error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Get pending invites for current user
export const getPendingInvites = async (req, res) => {
    try {
        const userId = req.userId;

        const invites = await ProjectInvite.find({
            toUserId: userId,
            status: 'pending'
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: invites
        });
    } catch (error) {
        console.error('Get pending invites error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Accept invite
export const acceptInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;
        const userId = req.userId;
        const { userEmail, userName, userImage } = req.body;

        const invite = await ProjectInvite.findOne({
            _id: inviteId,
            toUserId: userId,
            status: 'pending'
        });

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        // Add to project collaborators
        await Project.findByIdAndUpdate(invite.projectId, {
            $push: {
                collaborators: {
                    id: userId,
                    email: userEmail || invite.toUserEmail,
                    name: userName || '',
                    image: userImage || ''
                }
            }
        });

        // Update invite status
        invite.status = 'accepted';
        await invite.save();

        return res.status(200).json({
            success: true,
            message: 'Invite accepted'
        });
    } catch (error) {
        console.error('Accept invite error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Decline invite
export const declineInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;
        const userId = req.userId;

        const invite = await ProjectInvite.findOne({
            _id: inviteId,
            toUserId: userId,
            status: 'pending'
        });

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        invite.status = 'declined';
        await invite.save();

        return res.status(200).json({
            success: true,
            message: 'Invite declined'
        });
    } catch (error) {
        console.error('Decline invite error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// ============ INVITE LINK FUNCTIONS ============

// Create invite link for a project
export const createInviteLink = async (req, res) => {
    try {
        const { projectId, createdByName } = req.body;
        const userId = req.userId;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        // Check if project exists and user is owner or collaborator
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { ownerId: userId },
                { 'collaborators.id': userId }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or you do not have access' });
        }

        // Check if an active link already exists for this project by this user
        let existingLink = await ProjectInviteLink.findOne({
            projectId,
            createdBy: userId,
            isActive: true
        });

        if (existingLink) {
            // Return existing link
            const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            return res.status(200).json({
                success: true,
                message: 'Existing invite link returned',
                data: {
                    ...existingLink.toObject(),
                    inviteUrl: `${frontendUrl}/join/${existingLink.token}`
                }
            });
        }

        // Create new invite link
        const inviteLink = await ProjectInviteLink.create({
            projectId,
            projectName: project.name,
            projectColor: project.color,
            createdBy: userId,
            createdByName: createdByName || ''
        });

        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        return res.status(201).json({
            success: true,
            message: 'Invite link created',
            data: {
                ...inviteLink.toObject(),
                inviteUrl: `${frontendUrl}/join/${inviteLink.token}`
            }
        });
    } catch (error) {
        console.error('Create invite link error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Get invite link info (public - for join page)
export const getInviteLinkInfo = async (req, res) => {
    try {
        const { token } = req.params;

        const inviteLink = await ProjectInviteLink.findOne({ token, isActive: true });

        if (!inviteLink) {
            return res.status(404).json({ message: 'Invite link not found or has been deactivated' });
        }

        return res.status(200).json({
            success: true,
            data: {
                projectName: inviteLink.projectName,
                projectColor: inviteLink.projectColor,
                createdByName: inviteLink.createdByName
            }
        });
    } catch (error) {
        console.error('Get invite link info error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Accept invite link (join project via link)
export const acceptInviteLink = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.userId;
        const { userEmail, userName, userImage } = req.body;

        const inviteLink = await ProjectInviteLink.findOne({ token, isActive: true });

        if (!inviteLink) {
            return res.status(404).json({ message: 'Invite link not found or has been deactivated' });
        }

        // Check if user is already owner or collaborator
        const project = await Project.findById(inviteLink.projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project no longer exists' });
        }

        if (project.ownerId === userId) {
            return res.status(400).json({ message: 'You are the owner of this project' });
        }

        if (project.collaborators.some(c => c.id === userId)) {
            return res.status(400).json({ message: 'You are already a collaborator on this project' });
        }

        // Add user as collaborator
        await Project.findByIdAndUpdate(inviteLink.projectId, {
            $push: {
                collaborators: {
                    id: userId,
                    email: userEmail || '',
                    name: userName || '',
                    image: userImage || ''
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Successfully joined the project',
            data: {
                projectId: inviteLink.projectId,
                projectName: inviteLink.projectName
            }
        });
    } catch (error) {
        console.error('Accept invite link error:', error);
        return res.status(500).json({ message: error.message });
    }
};
