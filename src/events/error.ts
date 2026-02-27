import type { ExtendedClient } from '../types/global.js';
import logger from "../util/logger.js";

export default async (client: ExtendedClient, error) => {
    try {
        logger({ exception: error, client: client });
    } catch (e: any) {
        logger({ exception: e, client: client });
    };
};