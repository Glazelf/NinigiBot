module.exports.run = async (client, message) => {
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, <@${message.author.id}>.`);

        const Discord = require("discord.js");

        let memberFetch = await message.guild.members.fetch();
        let userID = message.content.slice(10);
        let user = message.mentions.users.first();
        let member = message.mentions.members.first();

        if (!user) {
            user = client.users.cache.get(userID);
        };

        if (!user) {
            user = message.author;
        };

        if (!member) {
            member = message.member;
        };

        let userCache = client.users.cache.get(user.id);
        let memberCache = memberFetch.get(user.id);
        let memberRoles = memberCache.roles.cache.filter(element => element.name !== "@everyone");

        let rolesSorted = "None";
        if (memberRoles.size !== 0) {
            rolesSorted = memberRoles.sort((r, r2) => r2.position - r.position).array().join(", ");
        };

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
        };

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

        const profileEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(userCache.username, userCache.avatarURL())
            .setThumbnail(userCache.avatarURL())
            .addField("Full account:", user, true)
            .addField("ID:", userCache.id, true)
            // WIP fix
            // .addField("Activity:", `${memberCache.presence.activities}`, true)
            .addField("Availability:", userStatus, true)
            .addField("Roles:", rolesSorted)
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
