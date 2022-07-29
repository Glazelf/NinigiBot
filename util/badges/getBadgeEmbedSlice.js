const BADGES_PER_PAGE = 10;
const Discord = require("discord.js");
const api_badge = require('../../database/dbServices/badge.api');      
module.exports = async (offset) => {
    const offset = 0;
    const badges_per_page = 10;
    let badge_list = await api_badge.getBadgeSlice(offset, badges_per_page);
    embed = new Discord.MessageEmbed().setColor(globalVars.embedColor)
    badge_list.slice.forEach(badge=>{
        embed.addFields({ name: '\u200B', value: `:${badge.icon}: ${badge.badge_id}`})
    })
    const navigation_buttons = new Discord.MessageActionRow()
    if(badge_list.buttons.includes('L')){
        navigation_buttons.addComponents(new Discord.MessageButton({ customId: 'bgd'+(offset-BADGES_PER_PAGE), style: 'PRIMARY', emoji: '⬅️'}))
    }
    if(badge_list.buttons.includes('R')){
        navigation_buttons.addComponents(new Discord.MessageButton({ customId: 'bgd'+(offset+BADGES_PER_PAGE), style: 'PRIMARY', emoji: '➡️'}))
    }
    return { embed:embed, components: navigation_buttons};
};