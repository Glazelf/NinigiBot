module.exports = ({ type1, type2 = null, bold = false, emotes = true }) => {
    const typeEmoteList = require('../../objects/pokemon/typeEmotes.json');
    const capitalizeString = require('../capitalizeString');
    let type1Emote = typeEmoteList[type1];
    let type1Name = capitalizeString(type1);
    if (bold == true) type1Name = `**${type1Name}**`;
    let typeString = `${type1Emote} ${type1Name}`;
    if (!emotes) typeString = type1Name;
    if (type2) {
        let type2Emote = typeEmoteList[type2];
        let type2Name = capitalizeString(type2);
        if (bold == true) type2Name = `**${type2Name}**`;
        typeString = `${type1Emote} ${type1Name}\n${type2Emote} ${type2Name}`;
        if (!emotes) typeString = `${type1Name}\n${type2Name}`;
    };
    return typeString;
};