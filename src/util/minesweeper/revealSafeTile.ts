import { ButtonStyle } from "discord.js";

export default (button, buttonEmoji) => {
    button
        .setStyle(ButtonStyle.Success)
        .setEmoji(buttonEmoji)
        .setDisabled(true);
    return;
};