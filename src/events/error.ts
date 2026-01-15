import type { ExtendedClient } from '../types/global.js';
import logger from "../util/logger.js";

export default async (client: ExtendedClient, info) => {
    try {
        logger(info, client);
    } catch (e: any) {
        logger({ exception: e, client: client });
    };
};