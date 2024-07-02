
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import { getTrophieslice } from "../../database/dbServices/trophy.api.js";

export default async (offset) => {
    const trophies_per_page = 10;
    let trophy_list = await getTrophieslice(offset, trophies_per_page);
    const embed = new EmbedBuilder().setColor(globalVars.embedColor);
    trophy_list.slice.forEach(trophy => {
        embed.addFields([{ name: "\u200B", value: `${trophy.dataValues.icon} ${trophy.dataValues.trophy_id}`, inline: true }]);
    });
    const navigation_buttons = new ActionRowBuilder();
    if (trophy_list.buttons.includes('L')) {
        const leftButton = new ButtonBuilder()
            .setCustomId('bgd' + (offset - trophies_per_page))
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬅️')
        navigation_buttons.addComponents(leftButton);
    };
    if (trophy_list.buttons.includes('R')) {
        const rightButton = new ButtonBuilder()
            .setCustomId('bgd' + (offset + trophies_per_page))
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➡️')
        navigation_buttons.addComponents(rightButton);
    };
    return { embed: embed, components: navigation_buttons };
};