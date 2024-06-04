import logger from "../util/logger";

export default async (client, oldMember, newMember) => {
    try {
        // Was used for vc text channel functionality, is now unused
        return;

    } catch (e) {
        logger(e, client);
    };
};