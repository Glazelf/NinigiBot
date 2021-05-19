module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");

        let memberList = [];
        let top = 10;
        let topMembersFormatted = "";

        message.guild.members.fetch();

        await message.guild.members.cache.forEach(member => {
            let joinRank = getJoinRank(member.id, message.guild);
            memberList.push({ joinRank: joinRank, memberTag: member.user.tag });
        });

        let memberListSorted = memberList.sort((a, b) => (a.joinRank - b.joinRank));
        let topMembers = memberListSorted.slice(0, top);

        topMembers.forEach(member => {
            topMembersFormatted += `${member.joinRank + 1}. ${member.memberTag}\n`;
        });

        return message.channel.send(topMembersFormatted, { code: true });

        function getJoinRank(userID, guild) {
            if (!guild.members.cache.get(userID)) return;
            // Sort all users by join time
            let arr = guild.members.cache.array();
            arr.sort((a, b) => a.joinedAt - b.joinedAt);
            // Get provided user
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id == userID) return i;
            };
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "joinlb",
    aliases: [],
    description: `Sends the top 10 longest time members.`
};