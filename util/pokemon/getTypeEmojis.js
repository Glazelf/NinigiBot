import { bold } from "discord.js";
import capitalizeString from "../capitalizeString.js";

export default ({ type, boldBool = false, emojis }) => {
    let typeName = capitalizeString(type);
    let emojiName = `PokemonType${typeName}`;
    if (typeName == "???") emojiName = `PokemonUnownQuestion`;
    let typeEmote = emojis.find(emoji => emoji.name == emojiName);
    if (boldBool == true) typeName = bold(typeName);
    if (typeEmote) typeName = `${typeEmote} ${typeName}`;
    return typeName;
};