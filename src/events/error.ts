import logger from "../util/logger.js";

export default async (client: any, info: any) => {
    try {
        // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
        logger(info, client);
    } catch (e) {
        logger({ exception: e, client: client });
    };
};