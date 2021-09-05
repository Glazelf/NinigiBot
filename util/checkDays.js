module.exports = async (client, date, language) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const getLanguageString = require('./getLanguageString');

        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff / 86400000);

        let daysAgoSingle = await getLanguageString(client, language, 'checkDaysAgoSingle');
        let daysAgoMultiple = await getLanguageString(client, language, 'checkDaysAgoMultiple');

        let returnString = daysAgoMultiple;
        if (days == 1) returnString = daysAgoSingle;
        return returnString;

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};