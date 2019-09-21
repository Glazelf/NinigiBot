exports.run = (client, message, args) => {
    try {
        function getUserFromMention(mention) {
            if (!mention) return;

            if (mention.startsWith('<@') && mention.endsWith('>')) {
                mention = mention.slice(2, -1);

                if (mention.startsWith('!')) {
                    mention = mention.slice(1);
                }
                return client.users.get(mention);
            }
        }

        if (args[0]) {
            const user = getUserFromMention(args[0]);
            if (!user) {
                return message.reply('> Please use a proper mention if you want to see someone else\'s avatar.');
            }
            return message.channel.send(`> ${user.username}'s avatar: 
> ${user.displayAvatarURL}`);
        }
        return message.channel.send(`> <@${message.member.user.id}>, your avatar: 
> ${message.author.displayAvatarURL}`);

    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);
        // log error
        console.log(e);
        return message.channel.send(`> An error has occurred trying to run the command, please contact <@${client.config.ownerID}>.`)
    };
};

module.exports.help = {
    name: "Avatar",
    description: "Replies a URL to the target's avatar.",
    usage: `avatar [target]`
}; 