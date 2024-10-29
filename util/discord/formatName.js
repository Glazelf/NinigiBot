import {
    bold,
    escapeItalic,
    escapeUnderline
} from "discord.js";

export default (input) => {
    return bold(escapeItalic(escapeUnderline(input)));
};