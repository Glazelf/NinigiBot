module.exports = async (client, birthday, language) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const getLanguageString = require('./getLanguageString');

        if (!birthday) return;
        let parsedMonth = await parseMonth(birthday[2] + birthday[3]);
        let returnString = `${parsedMonth} ${birthday[0] + birthday[1]}`;
        return returnString;

        async function parseMonth(month) {
            let january = await getLanguageString(client, language, 'parseDateJan');
            let february = await getLanguageString(client, language, 'parseDateFeb');
            let march = await getLanguageString(client, language, 'parseDateMar');
            let april = await getLanguageString(client, language, 'parseDateApr');
            let may = await getLanguageString(client, language, 'parseDateMay');
            let june = await getLanguageString(client, language, 'parseDateJun');
            let july = await getLanguageString(client, language, 'parseDateJul');
            let august = await getLanguageString(client, language, 'parseDateAug');
            let september = await getLanguageString(client, language, 'parseDateSep');
            let october = await getLanguageString(client, language, 'parseDateOct');
            let november = await getLanguageString(client, language, 'parseDateNov');
            let december = await getLanguageString(client, language, 'parseDateDec');

            const months = [, january, february, march, april, may, june, july, august, september, october, november, december];
            return months[parseInt(month)];
        };

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};