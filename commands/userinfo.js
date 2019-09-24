exports.run = (client, message, args) => {
    try {
        const Discord = require("discord.js");

        let user = message.mentions.users.first();

        if (!user) {
            user = message.author;
        };


        let presenceType = null;
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
        };
        
        let presenceName = null;
        if (!user.presence.game){
            presenceName = "None";
        } else {
            presenceName = user.presence.game;
        };

        const profileEmbed = new Discord.RichEmbed()
            .setColor(0x219dcd)
            .setAuthor(`User: ${user.tag}`)
            .addField("ID:", user.id, true)
            .setThumbnail(user.avatarURL)
            .addBlankField()
            .addField("Status:", user.presence.status, true)
            .addField("Activity:", `${presenceType} ${presenceName}`, true)
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