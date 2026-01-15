import logger from "../util/logger.js";

export default async (client: any, info) => {
    try {
        logger(info, client);
    } catch (e: any) {
        logger({ exception: e, client: client });
    };
};