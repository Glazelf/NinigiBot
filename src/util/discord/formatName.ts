import {
    bold,
    escapeItalic,
    escapeUnderline
} from "discord.js";

export default (input: any) => {
    if (!input || typeof input !== "string") return "";
    return bold(escapeItalic(escapeUnderline(input)));
};