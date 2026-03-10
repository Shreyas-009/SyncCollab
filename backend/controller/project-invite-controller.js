import ProjectInvite from '../model/project-invite-model.js';
import ProjectInviteLink from '../model/project-invite-link-model.js';
import Project from '../model/project-model.js';
import ActivityLog from '../model/activity-log-model.js';
import { createUserProfileResolver } from '../utils/user-profile-resolver.js';

const hydrateInvitesWithProfiles = async (invites) => {
    if (!invites || invites.length === 0) return [];

    const { resolveProfiles, addFallback } = createUserProfileResolver();
    const userIds = [];
    const fallbacksById = {};

    invites.forEach((inviteDoc) => {
        const invite = inviteDoc.toObject();
        if (!invite.fromUserId) return;
        userIds.push(invite.fromUserId);
        addFallback(fallbacksById, invite.fromUserId, {
            name: invite.fromUserName,
            image: invite.fromUserImage,
            email: invite.fromUserEmail
        });
    });

    const profiles = await resolveProfiles(userIds, fallbacksById);

    return invites.map((inviteDoc) => {
        const invite = inviteDoc.toObject();
        const fromProfile = invite.fromUserId ? profiles[invite.fromUserId] : null;
        return {
            ...invite,
            fromUserName: fromProfile?.name || invite.fromUserName || 'Unknown User',
            fromUserImage: fromProfile?.image || invite.fromUserImage || '',
            fromUserEmail: fromProfile?.email || invite.fromUserEmail || '',
            fromUser: fromProfile || null
        };
    });
};

// Send project invite
export const sendProjectInvite = async (req, res) => {
    try {
        const { projectId, toUserId } = req.body;
        const fromUserId = req.userId;

        if (!projectId || !toUserId) {
            return res.status(400).json({ message: 'Project ID and recipient ID are required' });
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

        if (project.ownerId === toUserId) {
            return res.status(400).json({ message: 'Project owner cannot be invited' });
        }

        const { resolveProfiles } = createUserProfileResolver();
        const profiles = await resolveProfiles([toUserId]);
        const recipientProfile = profiles[toUserId];

        if (!recipientProfile?.email) {
            return res.status(400).json({ message: 'Could not resolve recipient email from Clerk profile' });
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
            toUserId,
            toUserEmail: recipientProfile.email
        });

        return res.status(201).json({
            success: true,
            message: 'Invite sent',
            data: (await hydrateInvitesWithProfiles([invite]))[0]
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

        const hydratedInvites = await hydrateInvitesWithProfiles(invites);

        return res.status(200).json({
            success: true,
            data: hydratedInvites
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

        const invite = await ProjectInvite.findOne({
            _id: inviteId,
            toUserId: userId,
            status: 'pending'
        });

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        const project = await Project.findById(invite.projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project no longer exists' });
        }

        if (project.ownerId === userId) {
            return res.status(400).json({ message: 'You are the owner of this project' });
        }

        if (project.collaborators.some((collaborator) => collaborator.id === userId)) {
            return res.status(400).json({ message: 'You are already a collaborator on this project' });
        }

        // Add to project collaborators
        await Project.findByIdAndUpdate(invite.projectId, {
            $push: {
                collaborators: {
                    id: userId
                }
            }
        });

        // Update invite status
        invite.status = 'accepted';
        await invite.save();

        // Log the activity
        await ActivityLog.create({
            projectId: invite.projectId,
            userId,
            action: 'MEMBER_ADDED',
            taskSnapshot: `User joined the project via invitation.`
        });

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
        const { projectId } = req.body;
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
            const { resolveProfiles, addFallback } = createUserProfileResolver();
            const fallback = {};
            addFallback(fallback, existingLink.createdBy, { name: existingLink.createdByName });
            const profiles = await resolveProfiles([existingLink.createdBy], fallback);
            const creatorProfile = profiles[existingLink.createdBy];

            // Return existing link
            const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            return res.status(200).json({
                success: true,
                message: 'Existing invite link returned',
                data: {
                    ...existingLink.toObject(),
                    createdByName: creatorProfile?.name || existingLink.createdByName || 'Unknown User',
                    inviteUrl: `${frontendUrl}/join/${existingLink.token}`
                }
            });
        }

        // Create new invite link
        const inviteLink = await ProjectInviteLink.create({
            projectId,
            projectName: project.name,
            projectColor: project.color,
            createdBy: userId
        });

        const { resolveProfiles } = createUserProfileResolver();
        const profiles = await resolveProfiles([userId]);
        const creatorProfile = profiles[userId];
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        return res.status(201).json({
            success: true,
            message: 'Invite link created',
            data: {
                ...inviteLink.toObject(),
                createdByName: creatorProfile?.name || inviteLink.createdByName || 'Unknown User',
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

        const { resolveProfiles, addFallback } = createUserProfileResolver();
        const fallback = {};
        addFallback(fallback, inviteLink.createdBy, { name: inviteLink.createdByName });
        const profiles = await resolveProfiles([inviteLink.createdBy], fallback);
        const creatorProfile = profiles[inviteLink.createdBy];

        return res.status(200).json({
            success: true,
            data: {
                projectName: inviteLink.projectName,
                projectColor: inviteLink.projectColor,
                createdByName: creatorProfile?.name || inviteLink.createdByName || 'Unknown User'
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
                    id: userId
                }
            }
        });

        // Log the activity
        await ActivityLog.create({
            projectId: inviteLink.projectId,
            userId,
            action: 'MEMBER_ADDED',
            taskSnapshot: `User joined the project via invite link.`
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
