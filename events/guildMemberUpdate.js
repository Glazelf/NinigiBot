module.exports = async (client, member, newMember) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const log = member.guild.channels.cache.find(channel => channel.name === "log");
        if (!log) return;

        let user = client.users.cache.get(member.id);

        let updateCase = null;
        let topText = null;
        let changeText = null;
        if (member.nickname !== newMember.nickname) updateCase = "nickname";
        if (!member.premiumSince && newMember.premiumSince) updateCase = "nitroStart";
        if (member.premiumSince && !newMember.premiumSince) updateCase = "nitroEnd";
        if (!updateCase) return;

        const { PersonalRoles, PersonalRoleServers } = require('../database/dbObjects');
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: member.guild.id } });
        let roleDB = await PersonalRoles.findOne({ where: { server_id: member.guild.id, user_id: member.id } });
        if (!newMember.premiumSince && serverID && roleDB) await deleteBoosterRole();

        let avatar = user.displayAvatarURL({ format: "png", dynamic: true });

        switch (updateCase) {
            case "nickname":
                topText = "Nickname changed ⚒️";
                if (member.nickname && newMember.nickname) {
                    changeText = `**${member.nickname}** => **${newMember.nickname}**.`;
                } else if (newMember.nickname) {
                    changeText = `New: **${newMember.nickname}**.`;
                } else {
                    changeText = `Removed: **${member.nickname}**.`;
                };
                break;
            case "nitroStart":
                topText = "Started Nitro Boosting ⚒️";
                changeText = `**${member.guild.name}** now has ${member.guild.premiumSubscriptionCount} Nitro Boosts.`;
                break;
            case "nitroEnd":
                topText = "Stopped Nitro Boosting ⚒️";
                changeText = `**${member.guild.name}** now has ${member.guild.premiumSubscriptionCount} Nitro Boosts.`;
                break;
            default:
                topText = "Undefined guild member update event.";
                changeText = "Undefined guild member update event.";
                break;
        };

        const updateEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(topText, avatar)
            .setThumbnail(avatar)
            .setDescription(changeText)
            .addField(`User:`, `${user} (${user.id})`)
            .setFooter(user.tag)
            .setTimestamp();

        globalVars.totalLogs += 1;
        return log.send(updateEmbed);

        async function deleteBoosterRole() {
            let oldRole = member.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (oldRole) await oldRole.delete();
            await roleDB.destroy();
        };

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};
