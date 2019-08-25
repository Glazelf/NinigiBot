exports.run = (client, message, args) => {
    if (args[0]) {
		const user = getUserFromMention(args[0]);
		if (!user) {
			return message.reply('Please use a proper mention if you want to see someone else\'s avatar.');
		}

		return message.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL}`);
	}

	return message.channel.send(`${message.author.username}, your avatar: ${message.author.displayAvatarURL}`);
};

module.exports.help = {
    name: "Avatar",
    description: "Replies a URL to the target's avatar.",
    usage: `avatar [target]`
}; 