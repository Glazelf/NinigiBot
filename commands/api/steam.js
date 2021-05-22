module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const SteamAPI = require('steamapi');
        const steam = new SteamAPI(`${client.config.steam}`);

        // Sanitize and sort user input
        if (args.length < 2) return sendMessage(client, message, `Please provide either \`user\` or \`game\` and a valid ID.`);
        let subCommand = args[0].match(/(\w+)\s*([\s\S]*)/);
        let steamInput = args[1].match(/(\w+)\s*([\s\S]*)/);

        subCommand = subCommand.substring(0, subCommand.indexOf(" ")).toLowerCase();
        steamInput = steamInput.toLowerCase();

        // init variables
        let userFailString = `Could not find the specified user. 
> Make sure you either provide a userID (example: \`76561198084469073\`) or a custom link ID (check if <https://steamcommunity.com/id/${steamInput}> exists).`;
        let userName;
        let userID;
        let userAvatar;
        let userLevel;
        let userURL;
        let userLastOnline;
        let userCreated;
        let userBadges;
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

                    // Get badges
                    await steam.getUserBadges(userID).then(badges => {
                        userBadges = badges.badges.length;
                    }).catch(function (error) {
                        userBadges = null;
                    });

                    // Get game count, includes free games since my IP adress will get timed out by Steam for a day or two if I try to fetch ~1000 games per second for their price continually :)
                    await steam.getUserOwnedGames(userID).then(games => {
                        userGames = games.length;
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
                    if (userBadges) userEmbed.addField("Badges:", userBadges, true);
                    if (userGames) userEmbed.addField("Games Played:", userGames, true);
                    if (userFriends) userEmbed.addField("Friends:", userFriends, true);
                    if (userGroups) userEmbed.addField("Groups:", userGroups, true);
                    if (userLastOnline) userEmbed.addField("Last Online:", userLastOnline, true);
                    if (userCreated) userEmbed.addField("Created At:", userCreated, true);
                    userEmbed
                        .setFooter(message.member.user.tag)
                        .setTimestamp();

                    return sendMessage(client, message, userEmbed);

                } catch (e) {
                    // console.log(e);
                    return sendMessage(client, message, userFailString);
                };
            case "game":
                // Get game info from ID
                return sendMessage(client, message, `Game info goes here.`);
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
    aliases: [],
    description: "Shows Steam data",
    options: [{
        name: "user",
        type: "SUB_COMMAND",
        description: "Get info on a user.",
        options: [{
            name: "user-id",
            type: "STRING",
            description: "Target user's ID.",
        }]
    }, {
        name: "game",
        type: "SUB_COMMAND",
        description: "Get info on a game.",
        options: [{
            name: "game-id",
            type: "STRING",
            description: "Target game's ID.",
        }]
    }]
};