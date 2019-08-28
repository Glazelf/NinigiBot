exports.run = (client, message, args) => {
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
			return message.reply('Please use a proper mention if you want to see someone else\'s avatar.');
		}
		return message.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL}`);
	}
	return message.channel.send(`${message.member.user.username}, your avatar: ${message.author.displayAvatarURL}`);
};

module.exports.help = {
    name: "Avatar",
    description: "Replies a URL to the target's avatar.",
    usage: `avatar [target]`
}; 