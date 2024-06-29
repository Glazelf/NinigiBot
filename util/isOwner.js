export default async (client, user) => {
    try {
        let application = await client.application.fetch();
        let ownerID = application.owner.id;
        if (application.owner.constructor.name == "Team") ownerID = application.owner.ownerId;
        if (user.id == ownerID) return true;
        return false;

    } catch (e) {
        logger(e, client);
        return false;
    };
};