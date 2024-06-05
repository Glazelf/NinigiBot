import logger from "./logger.js";

export default async (client) => {
    try {
        let currentdate = new Date();
        let datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds() + " UTC";
        return datetime;

    } catch (e) {
        logger(e, client);
    };
};