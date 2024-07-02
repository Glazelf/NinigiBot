import { PermissionFlagsBits } from "discord.js";
import isAdmin from "./isAdmin.js";
import logger from "./logger.js";

export default (client, interaction, ephemeral = true) => {
    try {
        if (!interaction.inGuild()) return true;
        let adminBot = isAdmin(client, interaction.guild.members.me);
        if (ephemeral == true && !interaction.guild.members.me.permissions.has(PermissionFlagsBits.UseExternalEmojis) && !adminBot) return false;
        return true;

    } catch (e) {
        logger({ exception: e, client: client });
        return false;
    };
};