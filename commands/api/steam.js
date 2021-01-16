module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");
        const SteamAPI = require('steamapi');
        const steam = new SteamAPI(`${client.config.steam}`);
        const input = message.content.slice(2).trim();
        let [, , subCommand] = input.match(/(\w+)\s*([\s\S]*)/);
        if (!subCommand) return message.channel.send(`> Please provide a subCommand of either \`user\` or \`game\`, ${message.author}.`);
        let [, , steamInput] = subCommand.match(/(\w+)\s*([\s\S]*)/);
        if (!steamInput) return message.channel.send(`> Please provide a user or game ID, ${message.author}.`);
        subCommand = subCommand.substring(0, subCommand.indexOf(" ")).toLowerCase();
        steamInput = steamInput.toLowerCase();
        let userName;
        let ID;
        let avatar;
        let level;
        let URL;
        let lastOnline;
        let created;

        let userFailString = `> Could not find the specified user, ${message.author}. 
> Make sure you either provide a userID (example: \`76561198084469073\`) or a custom link ID (check if <https://steamcommunity.com/id/${steamInput}> exists).`

        switch (subCommand) {
            case "user":
                try {
                    // Try to convert non-numerical input to an ID
                    if (isNaN(steamInput)) {
                        await steam.resolve(`https://steamcommunity.com/id/${steamInput}`).then(id => {
                            steamInput = id;
                            console.log(steamInput)
                        });
                    };
                    // Get data from ID
                    await steam.getUserSummary(steamInput).then(summary => {
                        if (!summary) return;
                        userName = summary.nickname;
                        ID = summary.steamID;
                        avatar = summary.avatar[2];
                        URL = summary.url;
                        // I hate dates
                        if (summary.lastLogOff) {
                            lastOnline = new Date(summary.lastLogOff * 1000);
                            lastOnline = lastOnline.toUTCString().substr(5,);
                        } else {
                            lastOnline = "Private";
                        };
                        if (summary.created) {
                            created = new Date(summary.created * 1000);
                            created = `${created.toUTCString().substr(5,)}
${checkDays(created)}`;
                        } else {
                            created = "Private";
                        };
                        getAvatar(summary.avatar, "large");
                    });
                    // Get level
                    await steam.getUserLevel(ID).then(Level => {
                        level = Level;
                    });

                    // Check privacy of variables
                    level = checkPrivacy(level);
                    lastOnline = checkPrivacy(lastOnline);
                    created = checkPrivacy(created);

                    const userEmbed = new Discord.MessageEmbed()
                        .setColor(globalVars.embedColor)
                        .setAuthor(`${userName} (${ID})`, avatar)
                        .setThumbnail(avatar)
                        .addField("Profile:", `[Link](${URL} 'Profile URL')`, true)
                        .addField("Level:", level, true)
                        .addField("Last Online:", lastOnline, true)
                        .addField("Created At:", created, true)
                        .setFooter(message.author.tag)
                        .setTimestamp();

                    return message.channel.send(userEmbed);

                } catch (e) {
                    console.log(e);
                    return message.channel.send(userFailString);
                };
            case "game":
                return message.channel.send(`Game info goes here`)
        };

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
        };

        function checkPrivacy(field) {
            if (!field) {
                return "Private";
            } else {
                return field;
            };
        };

        async function getAvatar(object, input) {
            var keyList = Object.keys(object);
            keyList.forEach(function (key) {
                if (input == key) {
                    avatar = object[key];
                };
            });
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "steam",
    aliases: []
};