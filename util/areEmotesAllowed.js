import Discord from "discord.js";
import isAdmin from "./isAdmin.js";
import logger from "./logger.js";

export default (client, interaction, ephemeral) => {
    try {
        if (!interaction.inGuild()) return true;
        let adminBot = isAdmin(client, interaction.guild.members.me);
        if (ephemeral == true && !interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) && !adminBot) return false;
        return true;

    } catch (e) {
        logger(e, client);
        return false;
    };
};