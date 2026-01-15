import { ButtonStyle } from "discord.js";

export default (button: any, buttonEmoji: any) => {
    button
        .setStyle(ButtonStyle.Success)
        .setEmoji(buttonEmoji)
        .setDisabled(true);
    return;
};