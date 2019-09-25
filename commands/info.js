exports.run = (client, message, args) => {
    try {    
        const Discord = require("discord.js");
        
        let bot = client.users.find("id", client.config.botID);

        // Name presence type
        let presenceType = "Playing";
        if (bot.presence.game) {
            switch (bot.presence.game.type) {
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
        if (!bot.presence.game) {
            presenceName = "nothing";
        } else {
            presenceName = bot.presence.game;
        };

        const profileEmbed = new Discord.RichEmbed()
            .setColor(0x219dcd)
            .setAuthor(`Name: ${client.config.botName}`)
            .setThumbnail(bot.avatarURL)
            .addField("Activity:", `${presenceType} ${presenceName}`, true)
            .addField("Owner:", `<@${client.config.ownerID}>`, true)
            .addField("Full account:", client.config.botAccount, true)
            .addField("Bot ID:", client.config.botID, true)
            .addField("Code:", "[Github](https://github.com/Glazelf/NinigiBot 'NinigiBot')", true)
            .addField("Prefix:", client.config.prefix, true)
            .addField("Language:", `Javascript`, true)
            .addField("Contributors:", `<@${client.config.contributorZoraID}>, <@${client.config.contributorSkinnixID}>`)
            .addField("Created at:", bot.createdAt)
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
    name: "Info",
    description: "Displays some general info about this bot.",
    usage: `info`
};
