import Discord from "discord.js";
import isAdmin from "./isAdmin.js";

export default (client, interaction, ephemeral) => {
    let adminBot = isAdmin(client, interaction.guild.members.me);
    if (ephemeral == true && !interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) && !adminBot) return false;
    return true;
};