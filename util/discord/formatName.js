import {
    bold,
    escapeItalic,
    escapeUnderline
} from "discord.js";

export default (input, bold) => {
    if (!input || typeof input !== "string") return "";
    let output = escapeItalic(escapeUnderline(input));
    if (bold == true) output = bold(output);
    return output;
};