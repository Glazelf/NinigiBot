import typeEmoteList from "../../objects/pokemon/typeEmotes.json" with { type: "json" };
import capitalizeString from "../capitalizeString.js";

export default ({ type, bold = false }) => {
    let typeEmote = typeEmoteList[type];
    let typeName = capitalizeString(type);
    if (bold == true) typeName = `**${typeName}**`;
    let typeString = `${typeEmote} ${typeName}`;
    return typeString;
};