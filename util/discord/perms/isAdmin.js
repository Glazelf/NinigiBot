import { PermissionFlagsBits } from "discord.js";

export default (member) => {
    if (!member || !member.guild || !member.permissions) return false;
    console.log("Admin 1")
    if (member.guild.ownerID == member.id) {
        console.log("Admin 2")
        return true
    } else if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        console.log("Admin 3")
        return true;
    } else {
        console.log("Admin 4")
        return false;
    };
};