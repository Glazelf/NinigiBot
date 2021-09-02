module.exports = async (date, client) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const getLanguageString = require('./getLanguageString');
        const { Languages } = require('../database/dbObjects');
        let dbLanguage = await Languages.findOne({ where: { server_id: message.guild.id } });
        let language = globalVars.language;
        if (dbLanguage) language = dbLanguage.language;

        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff / 86400000);

        let daysSingle = await getLanguageString(client, language, 'checkDaysSingle');
        let daysMultiple = await getLanguageString(client, language, 'checkDaysMultiple');
        let daysAgo = await getLanguageString(client, language, 'checkDaysAgo');
        return days + (days == 1 ? ` ${daysSingle}` : ` ${daysMultiple}`) + ` ${daysAgo}`;

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};