import { PermissionFlagsBits } from "discord.js";
import logger from "./logger.js";

export default (client, member) => {
    try {
        if (!member || !member.guild || !member.permissions) return false;
        if (member.guild.ownerID == member.id) {
            return true
        } else if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            return true;
        } else {
            return false;
        };

    } catch (e) {
        logger({ exception: e, client: client });
        return false;
    };
};