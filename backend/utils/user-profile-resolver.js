import { getClerkClient } from './clerk-client.js';

const CHUNK_SIZE = 100;

const pickPrimaryEmail = (user) => {
    if (!user) return '';
    const primary = user.emailAddresses?.find((email) => email.id === user.primaryEmailAddressId);
    return primary?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '';
};

const pickDisplayName = (user) => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.username || pickPrimaryEmail(user) || '';
};

const normalizeUser = (user) => ({
    id: user.id,
    name: pickDisplayName(user),
    image: user.imageUrl || '',
    email: pickPrimaryEmail(user)
});

const mergeFallback = (profile, userId, fallback = {}) => ({
    id: userId,
    name: profile?.name || fallback.name || fallback.email || 'Unknown User',
    image: profile?.image || fallback.image || '',
    email: profile?.email || fallback.email || ''
});

const addFallback = (target, userId, fallback) => {
    if (!userId || !fallback) return;
    if (!target[userId]) {
        target[userId] = { name: '', image: '', email: '' };
    }
    target[userId].name = target[userId].name || fallback.name || '';
    target[userId].image = target[userId].image || fallback.image || '';
    target[userId].email = target[userId].email || fallback.email || '';
};

const chunk = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

export const createUserProfileResolver = () => {
    const clerkClient = getClerkClient();
    const cache = new Map();

    const resolveProfiles = async (userIds = [], fallbacksById = {}) => {
        const uniqueIds = [...new Set(userIds.filter(Boolean))];
        const missingIds = uniqueIds.filter((id) => !cache.has(id));

        if (clerkClient && missingIds.length > 0) {
            try {
                const idChunks = chunk(missingIds, CHUNK_SIZE);
                for (const idChunk of idChunks) {
                    const usersResponse = await clerkClient.users.getUserList({
                        userId: idChunk,
                        limit: idChunk.length
                    });
                    const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);
                    const foundIds = new Set();

                    users.forEach((user) => {
                        foundIds.add(user.id);
                        cache.set(user.id, normalizeUser(user));
                    });

                    idChunk.forEach((id) => {
                        if (!foundIds.has(id)) {
                            cache.set(id, null);
                        }
                    });
                }
            } catch (error) {
                console.error('User profile lookup failed:', error.message);
                missingIds.forEach((id) => {
                    if (!cache.has(id)) cache.set(id, null);
                });
            }
        } else {
            missingIds.forEach((id) => cache.set(id, null));
        }

        const result = {};
        uniqueIds.forEach((id) => {
            result[id] = mergeFallback(cache.get(id), id, fallbacksById[id]);
        });
        return result;
    };

    return {
        resolveProfiles,
        addFallback
    };
};
