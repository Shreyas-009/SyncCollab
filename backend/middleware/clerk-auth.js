import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { getClerkClient } from '../utils/clerk-client.js';
import ProjectInviteLink from '../model/project-invite-link-model.js';
import Project from '../model/project-model.js';
import { createUserProfileResolver } from '../utils/user-profile-resolver.js';
dotenv.config();

const clerkClient = getClerkClient();

const resolveFrontendBaseUrl = (req) => {
    const origin = req.get('origin') || req.headers?.origin;
    if (origin && origin !== 'null') return origin;
    if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
    const host = req.get('host');
    if (host) return `${req.protocol}://${host}`;
    return 'http://localhost:5173';
};

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
};

const buildInviteEmail = ({ projectName, inviterName, inviteUrl }) => {
    const subject = `Invitation: Join "${projectName}" on SyncCollab`;
    const text = [
        `Hi,`,
        ``,
        `${inviterName} invited you to join "${projectName}" on SyncCollab.`,
        `Accept the invitation to collaborate on tasks, boards, and updates.`,
        ``,
        `Join here: ${inviteUrl}`,
        ``,
        `If you don't have an account yet, sign up and you'll be added automatically.`,
        ``,
        `— SyncCollab`
    ].join('\n');

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f3f4f6; padding:28px;">
            <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:18px; padding:28px; border:1px solid #e5e7eb; box-shadow:0 10px 30px rgba(15,23,42,0.06);">
                <table role="presentation" style="border-collapse:separate; border-spacing:0; margin-bottom:20px;">
                    <tr>
                        <td style="padding-right:14px; vertical-align:middle;">
                            <div style="width:40px; height:40px; border-radius:12px; background:#7c3aed; color:#ffffff; font-weight:700; font-size:18px; line-height:40px; text-align:center;">S</div>
                        </td>
                        <td style="vertical-align:middle;">
                            <div style="font-size:16px; font-weight:700; color:#111827;">SyncCollab</div>
                            <div style="font-size:12px; color:#6b7280;">Project collaboration workspace</div>
                        </td>
                    </tr>
                </table>

                <h2 style="margin:0 0 8px; color:#111827; font-size:22px;">You're invited to join</h2>
                <div style="display:inline-block; padding:6px 10px; border-radius:999px; background:#ede9fe; color:#6d28d9; font-size:12px; font-weight:700; margin-bottom:10px;">
                    ${projectName}
                </div>
                <p style="margin:6px 0 18px; color:#4b5563; font-size:14px;">
                    <strong style="color:#111827;">${inviterName}</strong> invited you to collaborate on SyncCollab.
                </p>

                <a href="${inviteUrl}" style="display:inline-block; padding:12px 22px; background:#7c3aed; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:700; font-size:14px;">
                    Join Project
                </a>

                <p style="margin:16px 0 0; color:#6b7280; font-size:13px;">
                    If you don't have an account yet, sign up and you'll be added automatically.
                </p>

                <div style="margin-top:18px; padding:12px; background:#f8fafc; border:1px dashed #e5e7eb; border-radius:10px; font-size:12px; color:#6b7280;">
                    If the button doesn't work, paste this link into your browser:
                    <div style="margin-top:6px; color:#4b5563; word-break:break-all;">${inviteUrl}</div>
                </div>

                <div style="margin-top:22px; font-size:11px; color:#9ca3af;">
                    This invitation was sent from SyncCollab. If you weren't expecting this, you can ignore this email.
                </div>
            </div>
        </div>
    `;

    return { subject, text, html };
};

// Middleware to extract userId from header
export const requireAuth = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - No user ID provided' });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Send invitation email using Clerk (for new users)
export const sendInvitation = async (req, res) => {
    try {
        const { email, projectId } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const transporter = createTransporter();
        if (!transporter) {
            return res.status(500).json({ message: 'Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.' });
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { ownerId: req.userId },
                { 'collaborators.id': req.userId }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or you do not have access' });
        }

        let inviteLink = await ProjectInviteLink.findOne({
            projectId,
            createdBy: req.userId,
            isActive: true
        });

        if (!inviteLink) {
            inviteLink = await ProjectInviteLink.create({
                projectId,
                projectName: project.name,
                projectColor: project.color,
                createdBy: req.userId
            });
        }

        const { resolveProfiles, addFallback } = createUserProfileResolver();
        const fallback = {};
        addFallback(fallback, req.userId, { name: project.ownerName || 'Project Owner' });
        const profiles = await resolveProfiles([req.userId], fallback);
        const inviterName = profiles[req.userId]?.name || project.ownerName || 'Project Owner';

        const baseUrl = resolveFrontendBaseUrl(req);
        const frontendUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const inviteUrl = `${frontendUrl}/join/${inviteLink.token}`;

        const { subject, text, html } = buildInviteEmail({
            projectName: project.name,
            inviterName,
            inviteUrl
        });

        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
        if (!fromAddress) {
            return res.status(500).json({ message: 'Email sender not configured. Set SMTP_FROM or SMTP_USER.' });
        }

        await transporter.sendMail({
            from: fromAddress,
            to: email,
            subject,
            text,
            html
        });

        return res.status(200).json({
            success: true,
            message: `Invitation sent to ${email}`,
            data: { inviteUrl }
        });
    } catch (error) {
        console.error('Invitation error:', error);

        if (error.errors) {
            const clerkError = error.errors[0];
            return res.status(400).json({
                message: clerkError.longMessage || clerkError.message || 'Failed to send invitation',
                code: clerkError.code
            });
        }

        return res.status(500).json({ message: 'Failed to send invitation: ' + error.message });
    }
};

// Search for existing users by email
export const searchUsers = async (req, res) => {
    try {
        if (!clerkClient) {
            return res.status(500).json({ message: 'Clerk not configured. Add CLERK_SECRET_KEY to .env' });
        }

        const { email } = req.query;

        if (!email || email.length < 3) {
            return res.status(400).json({ message: 'Please provide at least 3 characters to search' });
        }

        // Get all users and filter by email
        const usersResponse = await clerkClient.users.getUserList({
            limit: 100
        });

        // Handle both possible response formats (array or object with data)
        const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);

        // Filter users whose email contains the search query
        const matchedUsers = users.filter(user =>
            user.emailAddresses && user.emailAddresses.some(e =>
                e.emailAddress.toLowerCase().includes(email.toLowerCase())
            ) && user.id !== req.userId
        );

        // Format response
        const formattedUsers = matchedUsers.map(user => ({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            imageUrl: user.imageUrl || ''
        }));

        return res.status(200).json({
            success: true,
            data: formattedUsers
        });
    } catch (error) {
        console.error('User search error:', error);
        return res.status(500).json({ message: 'Failed to search users: ' + error.message });
    }
};
