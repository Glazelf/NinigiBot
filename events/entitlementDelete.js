import { EmbedBuilder } from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, guild) => {
    try {
        return;

    } catch (e) {
        logger(e, client);
    };
};