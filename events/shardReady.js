import getTime from "../util/getTime.js";
import stan from "../affairs/stan.js";
import birthday from "../affairs/birthday.js";

export default async (client, id) => {
    try {
        let timestamp = getTime();
        // Start affairs
        stan(client);
        birthday(client);
        // const storedBalances = await Users.findAll();
        // storedBalances.forEach(b => bank.currency.set(b.user_id, b));
        // Console log status
        return console.log(`Launched shard ${id}. (${timestamp})`);

    } catch (e) {
        console.log(e);
    };
};