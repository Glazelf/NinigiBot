import logger from "../util/logger.js";

export default async (client, oldMember, newMember) => {
    try {
        // Was used for vc text channel functionality, is now unused
        return;

    } catch (e) {
        logger({ exception: e, client: client });
    };
};