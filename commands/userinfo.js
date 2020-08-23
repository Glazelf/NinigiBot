module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");
        const { bank } = require('../database/bank');
        const { Users } = require('../database/dbObjects');

        let memberFetch = await message.guild.members.fetch();
        let user = message.mentions.users.first();
        let member = message.mentions.members.first();

        if (!user) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
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

        //balance check
        let userBalance = `${Math.floor(bank.currency.getBalance(userCache.id))}💰`;
        let switchCode = bank.currency.getSwitchCode(userCache.id);
        let biography = bank.currency.getBiography(userCache.id);
        let birthday = bank.currency.getBirthday(userCache.id);

        // inventory check
        const target = message.mentions.users.first() || message.author;
        const userDB = await Users.findOne({ where: { user_id: target.id } });
        let itemField = 'None';
        if (userDB !== null) {
            const items = await userDB.getItems();
            itemField = items.map(t => `${t.amount} ${t.item.name}`).join(', ');
        };

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

        //Activities to string
        let activityLog = '';
        let customStatus = '';
        const activities = memberCache.presence.activities;
        for (const act in activities) {
            if (activities[act].name === 'Custom Status') {
                let emoji = null
                if (activities[act].emoji) emoji = client.emojis.cache.get(activities[act].emoji.id)
                if (emoji) customStatus = emoji.toString() + ' ';
                customStatus += activities[act].state;
            } else {
                activityLog += activities[act].name;
                if (activities[act].details || activities[act].state) activityLog += ': ';
                if (activities[act].details) activityLog += activities[act].details;
                if (activities[act].details && activities[act].state) activityLog += ', ';
                if (activities[act].state) activityLog += activities[act].state;
                activityLog += '\n';
            };
        };

        let actBool = new Boolean(activities[0]);
        if (actBool == true) {
            if (activities[0].name === 'Custom Status') {
                actBool = new Boolean(activities[1]);
            };
        };

        let avatar = null;
        if (userCache.avatarURL()) avatar = userCache.avatarURL({ format: "png", dynamic: true });

        const profileEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(userCache.username, avatar)
            .setThumbnail(avatar)
            .addField("Account:", user, true)
            .addField("Availability:", userStatus, true)
            .addField("Balance:", userBalance, true)
        if (customStatus.length >= 1 && customStatus !== 'null') profileEmbed.addField("Custom Status:", `${customStatus}`, true);
        if (birthday) profileEmbed.addField("Birthday:", `${require('../util/parseDate')(birthday)}`, true);
        if (actBool == true) profileEmbed.addField("Activities:", `${activityLog}`, false);
        if (switchCode && switchCode !== 'None') profileEmbed.addField("Switch friend code:", switchCode, true);
        if (biography && biography !== 'None') profileEmbed.addField("Biography:", biography, false);
        if (itemField && itemField != 'None') profileEmbed.addField("Inventory:", itemField, false);
        profileEmbed
            .addField("Roles:", rolesSorted, false)
            .addField("Joined at:", `${memberCache.joinedAt.toUTCString().substr(0, 16)}, ${checkDays(memberCache.joinedAt)}.`, false)
            .addField("Created at:", `${userCache.createdAt.toUTCString().substr(0, 16)}, ${checkDays(userCache.createdAt)}.`, false)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        return message.channel.send(profileEmbed);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
