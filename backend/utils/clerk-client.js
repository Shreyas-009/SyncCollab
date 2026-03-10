import { createClerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

const clerkClient = clerkSecretKey
    ? createClerkClient({ secretKey: clerkSecretKey })
    : null;

if (!clerkClient) {
    console.warn('WARNING: CLERK_SECRET_KEY not set. Dynamic user profile resolution is disabled.');
}

export const getClerkClient = () => clerkClient;
