import capitalizeString from "../capitalizeString.js";

export default ({ type, bold = false, emojis }) => {
    let typeName = capitalizeString(type);
    let emojiName = `PokemonType${typeName}`;
    if (typeName == "???") emojiName = `PokemonUnownQuestion`;
    let typeEmote = emojis.find(emoji => emoji.name == emojiName);
    if (!typeEmote) return "";
    if (bold == true) typeName = `**${typeName}**`;
    let typeString = `${typeEmote} ${typeName}`;
    return typeString;
};