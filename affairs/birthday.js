module.exports = async (client) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const getLanguageString = require('../util/getLanguageString');
        const Discord = require("discord.js");
        const cron = require("cron");
        const timezone = 'cest';
        const time = '05 00 00 * * *'; //Sec Min Hour 
        const guildID = client.config.botServerID;
        const channelID = globalVars.eventChannelID;
        const { Languages } = require('../database/dbObjects');
        const { bank } = require('../database/bank');
        const { search } = require('../util/search');

        let dbLanguage = await Languages.findOne({ where: { server_id: message.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        new cron.CronJob(time, async () => {
            let globalVars = require('../events/ready');
            let guild = client.guilds.cache.get(guildID);
            if (!guild) return;
            const birthdayRole = guild.roles.cache.find(role => role.id === globalVars.birthdayRole);
            if (!birthdayRole) return;
            let yesterdayCuties = birthdayRole.members;
            yesterdayCuties.forEach(cutie => cutie.roles.remove(birthdayRole));
            const cuties = [];
            for (m in [...guild.members.cache.values()]) {
                const member = [...guild.members.cache.values()][m];
                const birthday = bank.currency.getBirthday(member.id);
                if (birthday) {
                    let now = new Date();
                    if (now.getDate() === parseInt(birthday.substring(0, 2)) && (now.getMonth() + 1) === parseInt(birthday.substring(2))) {
                        cuties.push(member.user.tag);
                        await member.roles.add(birthdayRole);
                    };
                };
            };

            if (cuties.length < 1) return;

            let channel = guild.channels.cache.find(channel => channel.id === channelID);

            let birthdayAffairDescriptionString = await getLanguageString(client, language, 'birthdayAffairDescription');
            let birthdayAffairJoinWordString = await getLanguageString(client, language, 'birthdayAffairJoinWord');
            let birthdayDescription = birthdayAffairDescriptionString.replace('[0]', cuties.join(` ${birthdayAffairJoinWordString} `));

            const gifEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setDescription(birthdayDescription)
                .setImage(search("birthday"))
                .setTimestamp();
            channel.send({ embeds: [gifEmbed] });
        }, timeZone = timezone, start = true);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, message);
    };
};
