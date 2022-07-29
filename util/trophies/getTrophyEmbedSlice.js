const TROPHIES_PER_PAGE = 10;
const Discord = require("discord.js");
const api_trophy = require('../../database/dbServices/trophy.api');      
let globalVars = require('../../events/ready');
module.exports = async (offset) => {
    const trophies_per_page = 10;
    let trophy_list = await api_trophy.getTrophieslice(offset, trophies_per_page);
    const embed = new Discord.MessageEmbed().setColor(globalVars.embedColor)
    
    trophy_list.slice.forEach(trophy=>{
        embed.addFields({ name: '\u200B', value: `${trophy.dataValues.icon} ${trophy.dataValues.trophy_id}`})
    })
    const navigation_buttons = new Discord.MessageActionRow()
    if(trophy_list.buttons.includes('L')){
        navigation_buttons.addComponents(new Discord.MessageButton({ customId: 'bgd'+(offset-TROPHIES_PER_PAGE), style: 'PRIMARY', emoji: '⬅️'}))
    }
    if(trophy_list.buttons.includes('R')){
        navigation_buttons.addComponents(new Discord.MessageButton({ customId: 'bgd'+(offset+TROPHIES_PER_PAGE), style: 'PRIMARY', emoji: '➡️'}))
    }

    return { embed:embed, components: navigation_buttons};
};