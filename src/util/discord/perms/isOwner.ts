import type { ExtendedClient } from '../../../types/global.js';

export default async (client: ExtendedClient, user) => {
    let application = await client.application.fetch();
    let ownerID = application.owner.id;
    if ((application.owner as any).constructor.name == "Team") ownerID = (application.owner as any).ownerId;
    if (user.id == ownerID) return true;
    return false;
};