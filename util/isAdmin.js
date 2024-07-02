import { PermissionFlagsBits } from "discord.js";

export default (member) => {
    if (!member || !member.guild || !member.permissions) return false;
    if (member.guild.ownerID == member.id) {
        return true
    } else if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        return true;
    } else {
        return false;
    };
};