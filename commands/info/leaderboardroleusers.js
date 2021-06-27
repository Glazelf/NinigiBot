exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        if (message.guild.roles.cache.size < 1) return sendMessage(client, message, "This server doesn't have any roles yet.");

        let avatar = message.member.user.displayAvatarURL({ format: "png", dynamic: true });
        await message.guild.roles.fetch();
        let roleArray = [];

        await message.guild.roles.cache.forEach(role => {
            if (role.name == "@everyone") return;
            let memberCount = message.guild.members.cache.filter(member => member.roles.cache.find(loopRole => loopRole == role)).size;
            roleArray.push({
                id: role.id,
                size: memberCount
            });
        });

        let leaderboardRoleString = roleArray.sort(sortObjectArray)
            .slice(0, 10)
            .map((role, position) => `${position + 1}. <@&${role.id}>: ${role.size}`)
            .join("\n");

        const leaderboardRoleEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`Roles by users:`, avatar)
            .setDescription(leaderboardRoleString)
            .setFooter(message.member.user.tag)
            .setTimestamp();

        return sendMessage(client, message, null, leaderboardRoleEmbed);

        function sortObjectArray(a, b) {
            if (a.size < b.size) {
                return 1;
            };
            if (a.size > b.size) {
                return -1;
            };
            return 0;
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "leaderboardroleusers",
    aliases: ["lbroleusers", "lbru"],
    description: "Displays a leaderboard of the roles that have the most users."
};