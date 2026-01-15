import {
    bold,
    escapeItalic,
    escapeUnderline
} from "discord.js";

export default (input: any, boldBool: any) => {
    if (!input || typeof input !== "string") return "";
    let output = escapeItalic(escapeUnderline(input));
    if (boldBool == true) output = bold(output);
    return output;
};