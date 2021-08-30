module.exports = async (client, language, stringName) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        let languageString = client.languages[language][stringName];
        if (!languageString || languageString.length < 1) languageString = client.languages['en'][stringName];
        return languageString;

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};