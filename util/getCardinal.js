module.exports = async (client, language, number) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const getLanguageString = require('./getLanguageString');

        let st = await getLanguageString(client, language, 'getCardinalst');
        let nd = await getLanguageString(client, language, 'getCardinalnd');
        let rd = await getLanguageString(client, language, 'getCardinalrd');
        let th = await getLanguageString(client, language, 'getCardinalth');

        if (number % 10 === 1 && number !== 11) return number + st;
        if (number % 10 === 2 && number !== 12) return number + nd;
        if (number % 10 === 3 && number !== 13) return number + rd;
        return number + th;
    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};