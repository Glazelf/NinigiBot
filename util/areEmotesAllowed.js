import { PermissionFlagsBits } from "discord.js";
import isAdmin from "./isAdmin.js";

export default (interaction, ephemeral = true) => {
    if (!interaction.inGuild()) return true;
    let adminBot = isAdmin(interaction.guild.members.me);
    if (ephemeral == true && !interaction.guild.members.me.permissions.has(PermissionFlagsBits.UseExternalEmojis) && !adminBot) return false;
    return true;
};