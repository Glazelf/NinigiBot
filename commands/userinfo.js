exports.run = (client, message, args) => {
    try {
        const Discord = require("discord.js");

        function getUserFromMention(mention) {
            if (!mention) return;

            if (mention.startsWith('<@') && mention.endsWith('>')) {
                mention = mention.slice(2, -1);

                if (mention.startsWith('!')) {
                    mention = mention.slice(1);
                };
                return client.users.get(mention);
            };
        };

        if (args[0]) {
            const user = getUserFromMention(args[0]);
            if (!user) {
                return message.reply(`> Please use a proper mention if you want to see someone's userinfo, <@${message.author.id}.`);
            };
            const avatarEmbed = new Discord.RichEmbed()
                .setColor(0x219dcd)
                .setAuthor(user.username)
                .setImage(user.avatarURL);
            return message.channel.send(avatarEmbed);
        };
        const avatarEmbed = new Discord.RichEmbed()
            .setColor(0x219dcd)
            .setAuthor(user.username)
            .setImage(user.avatarURL);
        return message.channel.send(avatarEmbed);

    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);

        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, <@${message.author.id}>, please use "${client.config.prefix}report" to report the issue.`);
    };
};

module.exports.help = {
    name: "Userinfo",
    description: "Replies a URL to the target's avatar.",
    usage: `userinfo [optional target]`
}; 