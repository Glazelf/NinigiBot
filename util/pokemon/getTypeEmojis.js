import typeEmojiList from "../../objects/pokemon/typeEmojis.json" with { type: "json" };
import capitalizeString from "../capitalizeString.js";

export default ({ type, bold = false }) => {
    let typeEmote = typeEmojiList[type];
    let typeName = capitalizeString(type);
    if (bold == true) typeName = `**${typeName}**`;
    let typeString = `${typeEmote} ${typeName}`;
    return typeString;
};