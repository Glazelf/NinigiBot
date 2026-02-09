import {
    bold,
    escapeItalic,
    escapeUnderline
} from "discord.js";

export default (input, boldBool) => {
    if (!input || typeof input !== "string") return "";
    let output = escapeItalic(escapeUnderline(input));
    if (boldBool == true) output = bold(output);
    return output;
};