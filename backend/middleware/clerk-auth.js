import { createClerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Clerk client with secret key
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
let clerkClient = null;

if (clerkSecretKey) {
    clerkClient = createClerkClient({ secretKey: clerkSecretKey });
} else {
    console.warn('WARNING: CLERK_SECRET_KEY not set. User search and invitations will not work.');
}

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
        if (!clerkClient) {
            return res.status(500).json({ message: 'Clerk not configured. Add CLERK_SECRET_KEY to .env' });
        }

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const invitation = await clerkClient.invitations.createInvitation({
            emailAddress: email,
            redirectUrl: process.env.CLIENT_URL,
            publicMetadata: {
                invitedBy: req.userId
            }
        });

        return res.status(200).json({
            success: true,
            message: `Invitation sent to ${email}`,
            data: invitation
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
