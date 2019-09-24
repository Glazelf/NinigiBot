exports.run = (client, message, args) => {
    try {
        const Discord = require("discord.js");

        let user = message.mentions.users.first();

        if (!user) {
            user = message.author;
        };

        // Name presence type
        let presenceType = "Playing";
        if (user.presence.game) {
            switch (user.presence.game.type) {
                case 0:
                    presenceType = "Playing";
                    break;
                case 1:
                    presenceType = "Streaming";
                    break;
                case 2:
                    presenceType = "Listening to";
                    break;
                case 3:
                    presenceType = "Watching";
                    break;
                default:
                    presenceType = "Playing";
                    break;
            };
        } else {
            presenceType = "Playing";
        };

        // Define presence name
        let presenceName = "";
        if (!user.presence.game) {
            presenceName = "nothing";
        } else {
            presenceName = user.presence.game;
        };

        // Clear up status wording
        let userStatus = "Error?";
        switch (user.presence.status) {
            case "online":
                userStatus = "Online";
                break;
            case "idle":
                userStatus = "Idle";
                break;
            case "dnd":
                userStatus = "Busy";
                break;
            case "invisible":
                userStatus = "Invisible";
                break;
            case "offline":
                userStatus = "Offline";
                break;
            default:
                userStatus = "Error?";
                break;
        };

        const profileEmbed = new Discord.RichEmbed()
            .setColor(0x219dcd)
            .setAuthor(`User: ${user.tag}`)
            .addField("ID:", user.id, true)
            .setThumbnail(user.avatarURL)
            .addBlankField()
            .addField("Activity:", `${presenceType} ${presenceName}`, true)
            .addField("Availability:", userStatus, true)
            .addField("Created at:", user.createdAt, true)
            .setFooter(`Requested by ${message.author.tag} at:`)
            .setTimestamp();

        return message.channel.send(profileEmbed);

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
    description: "Replies with information about a user.",
    usage: `userinfo [optional target]`
}; 