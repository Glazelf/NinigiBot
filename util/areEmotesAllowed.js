import { PermissionFlagsBits } from "discord.js";
import isAdmin from "./isAdmin.js";
import logger from "./logger.js";

export default (interaction, ephemeral = true) => {
    try {
        if (!interaction.inGuild()) return true;
        let adminBot = isAdmin(interaction.guild.members.me);
        if (ephemeral == true && !interaction.guild.members.me.permissions.has(PermissionFlagsBits.UseExternalEmojis) && !adminBot) return false;
        return true;

    } catch (e) {
        logger({ exception: e, interaction: interaction });
        return false;
    };
};