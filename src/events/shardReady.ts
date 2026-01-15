import getTime from "../util/getTime.js";
import logger from "../util/logger.js";

export default async (client: any, id) => {
    try {
        let timestamp = getTime();
        // const storedBalances = await Users.findAll();
        // storedBalances.forEach(b => bank.currency.set(b.user_id, b));
        // Console log status
        return console.log(`Launched shard ${id}. (${timestamp})`);

    } catch (e: any) {
        console.log(e);
        logger({ exception: e, client: client });
    };
};