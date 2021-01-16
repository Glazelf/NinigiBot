module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");
        const SteamAPI = require('steamapi');
        const steam = new SteamAPI(`${client.config.steam}`);

        // Sanitize and sort user input
        const input = message.content.slice(2).trim();
        let [, , subCommand] = input.match(/(\w+)\s*([\s\S]*)/);
        if (!subCommand) return message.channel.send(`> Please provide a subCommand of either \`user\` or \`game\`, ${message.author}.`);
        let [, , steamInput] = subCommand.match(/(\w+)\s*([\s\S]*)/);
        if (!steamInput) return message.channel.send(`> Please provide a user or game ID, ${message.author}.`);
        subCommand = subCommand.substring(0, subCommand.indexOf(" ")).toLowerCase();
        steamInput = steamInput.toLowerCase();

        // init variables
        let userFailString = `> Could not find the specified user, ${message.author}. 
> Make sure you either provide a userID (example: \`76561198084469073\`) or a custom link ID (check if <https://steamcommunity.com/id/${steamInput}> exists).`;
        let userName;
        let userID;
        let userAvatar;
        let userLevel;
        let userURL;
        let userLastOnline;
        let userCreated;
        let userGames;
        let userFriends;
        let userGroups;

        switch (subCommand) {
            case "user":
                try {
                    // Try to convert non-numerical input to an ID
                    if (isNaN(steamInput)) {
                        await steam.resolve(`https://steamcommunity.com/id/${steamInput}`).then(id => {
                            steamInput = id;
                        });
                    };
                    // Get user data from ID
                    await steam.getUserSummary(steamInput).then(summary => {
                        if (!summary) return;
                        userName = summary.nickname;
                        userID = summary.steamID;
                        userURL = summary.url;
                        getUserAvatar(summary.avatar, "large");
                        // I hate dates
                        if (summary.lastLogOff) {
                            userLastOnline = new Date(summary.lastLogOff * 1000);
                            userLastOnline = userLastOnline.toUTCString().substr(5,);
                        } else {
                            userLastOnline = null;
                        };
                        if (summary.created) {
                            userCreated = new Date(summary.created * 1000);
                            userCreated = `${userCreated.toUTCString().substr(5,)}
${checkDays(userCreated)}`;
                        } else {
                            userCreated = null;
                        };
                    });

                    // Get level
                    await steam.getUserLevel(userID).then(level => {
                        userLevel = level;
                    });

                    // Get game count
                    await steam.getUserOwnedGames(userID).then(games => {
                        userGames = games.length;
                        games.forEach(async game => {
                            await steam.getGameDetails(game.appID).then(gameInfo => {
                                if (!gameInfo.price_overview) userGames = userGames - 1;
                            });
                        });
                    }).catch(function (error) {
                        userGames = null;
                    });

                    // Get friend count
                    await steam.getUserFriends(userID).then(friends => {
                        userFriends = friends.length;
                    }).catch(function (error) {
                        userFriends = null;
                    });

                    // Get group count
                    await steam.getUserGroups(userID).then(groups => {
                        userGroups = groups.length;
                    }).catch(function (error) {
                        userGroups = null;
                    });

                    // Check privacy of variables
                    userLevel = checkPrivacy(userLevel);
                    userLastOnline = checkPrivacy(userLastOnline);
                    userCreated = checkPrivacy(userCreated);

                    // Build and send user embed
                    const userEmbed = new Discord.MessageEmbed()
                        .setColor(globalVars.embedColor)
                        .setAuthor(`${userName} (${userID})`, userAvatar)
                        .setThumbnail(userAvatar)
                        .addField("Profile:", `[Link](${userURL} 'Profile URL')`, true);
                    if (userLevel) userEmbed.addField("Level:", userLevel, true);
                    if (userGames) userEmbed.addField("Games Played:", userGames, true);
                    if (userFriends) userEmbed.addField("Friends:", userFriends, true);
                    if (userGroups) userEmbed.addField("Groups:", userGroups, true);
                    if (userLastOnline) userEmbed.addField("Last Online:", userLastOnline, true);
                    if (userCreated) userEmbed.addField("Created At:", userCreated, true);
                    userEmbed
                        .setFooter(message.author.tag)
                        .setTimestamp();

                    return message.channel.send(userEmbed);

                } catch (e) {
                    console.log(e);
                    return message.channel.send(userFailString);
                };
            case "game":
                // Get game info from ID
                return message.channel.send(`Game info goes here, ${message.author}.`);
        };

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
        };

        function checkPrivacy(field) {
            if (!field) {
                return null;
            } else {
                return field;
            };
        };

        async function getUserAvatar(object, input) {
            var keyList = Object.keys(object);
            keyList.forEach(function (key) {
                if (input == key) {
                    userAvatar = object[key];
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