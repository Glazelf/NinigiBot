const TROPHIES_PER_PAGE = 10;
const Discord = require("discord.js");
const api_trophy = require('../../database/dbServices/trophy.api');
module.exports = async (client, offset) => {
    const trophies_per_page = 10;
    let trophy_list = await api_trophy.getTrophieslice(offset, trophies_per_page);
    const embed = new Discord.EmbedBuilder().setColor(client.globalVars.embedColor);
    trophy_list.slice.forEach(trophy => {
        embed.addFields([{ name: "\u200B", value: `${trophy.dataValues.icon} ${trophy.dataValues.trophy_id}`, inline: true }]);
    });
    const navigation_buttons = new Discord.ActionRowBuilder();
    if (trophy_list.buttons.includes('L')) navigation_buttons.addComponents(new Discord.ButtonBuilder({ customId: 'bgd' + (offset - TROPHIES_PER_PAGE), style: Discord.ButtonStyle.Primary, emoji: '⬅️' }));
    if (trophy_list.buttons.includes('R')) navigation_buttons.addComponents(new Discord.ButtonBuilder({ customId: 'bgd' + (offset + TROPHIES_PER_PAGE), style: Discord.ButtonStyle.Primary, emoji: '➡️' }));
    return { embed: embed, components: navigation_buttons };
};