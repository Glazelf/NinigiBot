import logger from "../util/logger";

export default async (client, info) => {
    try {
        logger(info, client);
    } catch (e) {
        logger(e, client);
    };
};