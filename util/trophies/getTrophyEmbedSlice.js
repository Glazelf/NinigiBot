
import Discord from "discord.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import { getTrophieslice } from "../../database/dbServices/trophy.api.js";

export default async (client, offset) => {
    const trophies_per_page = 10;
    let trophy_list = await getTrophieslice(offset, trophies_per_page);
    const embed = new Discord.EmbedBuilder().setColor(globalVars.embedColor);
    trophy_list.slice.forEach(trophy => {
        embed.addFields([{ name: "\u200B", value: `${trophy.dataValues.icon} ${trophy.dataValues.trophy_id}`, inline: true }]);
    });
    const navigation_buttons = new Discord.ActionRowBuilder();
    if (trophy_list.buttons.includes('L')) navigation_buttons.addComponents(new Discord.ButtonBuilder({ customId: 'bgd' + (offset - trophies_per_page), style: Discord.ButtonStyle.Primary, emoji: '⬅️' }));
    if (trophy_list.buttons.includes('R')) navigation_buttons.addComponents(new Discord.ButtonBuilder({ customId: 'bgd' + (offset + trophies_per_page), style: Discord.ButtonStyle.Primary, emoji: '➡️' }));
    return { embed: embed, components: navigation_buttons };
};