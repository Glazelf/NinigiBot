module.exports.run = async (client, message) => {
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't send you embeds because I don't have permissions to send embedded messages, <@${message.author.id}>.`);

        const Discord = require("discord.js");

        let user = message.mentions.users.first();
        let member = message.mentions.members.first();

        if (!user) {
            user = message.author;
        };

        if (!member) {
            member = message.member;
        };

        let userCache = client.users.cache.get(user.id);
        let memberCache = message.guild.members.cache.get(member.id);

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
        };

        // convert user to member for server related stats
        //let member = client.members.find('id', userCache.id);

        // Name presence type
        let presenceType = "Playing";
        if (userCache.presence.game) {
            switch (userCache.presence.game.type) {
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
        if (!userCache.presence.game) {
            presenceName = "nothing";
        } else {
            presenceName = userCache.presence.game;
        };

        // Clear up status wording
        let userStatus = "Error?";
        switch (userCache.presence.status) {
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

        function getRoles() {
            let elementArray = [];
            let elementList = [];
            memberCache.roles.cache.forEach(element => {
                if (element.name != '@everyone')
                    elementArray.push(element)
            });

            elementArray.sort(function (a, b) { return b.position - a.position })

            elementArray.forEach(element => {
                elementList += `${element} `
            });

            if (!elementArray[1]) {
                elementList = "None";
            };

            return elementList;
        };

        //console.log(memberCache.presence.activities)

        const profileEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(userCache.username, userCache.avatarURL())
            .setThumbnail(userCache.avatarURL())
            .addField("Full account:", user, true)
            .addField("ID:", userCache.id, true)
            .addField("Activity:", `${presenceType} ${presenceName}`, true)
            // .addField("Activity:", `${memberCache.presence.activities}`, true)
            .addField("Availability:", userStatus, true)
            .addField("Roles:", getRoles())
            .addField("Joined at:", `${memberCache.joinedAt.toUTCString().substr(0, 16)}, ${checkDays(memberCache.joinedAt)}.`)
            .addField("Created at:", `${userCache.createdAt.toUTCString().substr(0, 16)}, ${checkDays(userCache.createdAt)}.`)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        return message.channel.send(profileEmbed);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: "Userinfo",
    description: "Returns information about a userCache.",
    usage: `userinfo [optional target]`
}; 