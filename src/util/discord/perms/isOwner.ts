import type { ExtendedClient } from '../../../types/global.js';

export default async (client: ExtendedClient, user) => {
    let application = await client.application.fetch();
    let ownerID = application.owner.id;
    const owner = application.owner as any;
    if (owner.constructor?.name === "Team") ownerID = owner.ownerId;
    if (user.id == ownerID) return true;
    return false;
};