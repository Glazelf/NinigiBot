module.exports = async (client, language = 'en', stringName) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        let guildLanguage = client.languages[language];
        if (!guildLanguage) guildLanguage = client.languages['en'];
        let languageString = guildLanguage[stringName];
        if (!languageString || languageString.length < 1) languageString = client.languages['en'][stringName];
        return languageString;

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};