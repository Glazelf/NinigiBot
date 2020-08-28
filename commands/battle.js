const UserItems = require('../database/models/UserItems');
const { min } = require('lodash');
const ShinxBattle = require('../shinx/shinxBattle')

module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const { bank } = require('../database/bank');
        const Discord = require("discord.js");
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);
        if(biography.length<1) return message.channel.send('Please specify a user to battle.')
        const trainers = [message.author, message.mentions.users.first()]
        const shinxes = [new ShinxBattle(trainerOne, await bank.currency.getShinx(trainerOne.id)), new ShinxBattle(trainerTwo, await bank.currency.getShinx(trainerTwo.id))]
        const nicks = []
        for(let i = 0; i < 2; i++) shinxes[i].nick.trim().toLowerCase()==='shinx'? nicks.push(`${shinxes[i].owner.username}'s shinx`):nicks.push(shinxes[i].nick) 
        while(true){
            message.channel.send(`${nicks[0]}: ${Math.floor(shinxes[0].percent*100)}%\n${nicks[1]}: ${Math.floor(shinxes[1].percent*100)}%`)
            const numbers = []
            for(let i = 0; i<2; i++){
                await message.channel.send(`${trainers[i]} please specify a number`)
                numbers[i] = await message.channel.awaitMessages(m=> m.author.id == trainers[i].id, {max:1, time : 30000})
                try{ 
                    numbers[i] = numbers[i].first().content
                    if(isNaN(numbers[i])) numbers[i] = 0
                }
                catch(e){ numbers[i] = 0}
            }
            message.channel.send(`${nicks[0]}: ${Math.floor(shinxes[0].percent*100)}%\n${nicks[1]}: ${Math.floor(shinxes[1].percent*100)}%`)
            const result = numbers[0] + numbers[1] + Math.floor(Math.random()*16)
            const random = Math.floor(Math.random()*2)
            const buff = shinxes[random].applyRandomBuff(result)
            message.channel.send(`${nicks[random]} ${buff}!`)
            for(let i = 0; i < 2; i++){
                if(shinxes[i].saiyanMode()) await message.channel.send(`${nicks[i]} entered super saiyan mode!`)
                if(shinxes[i].knocked) await message.channel.send(`${nicks[i]} can't move!`)
                else {
                    const attackMove = shinxes[i].attack();
                    await message.channel.send(`${nicks[i]} uses ${attackMove[0]}!`)
                    if (shinxes[(i+1)%2].takeDamage(attackMove)){
                        message.channel.send(`${nicks[(i+1)%2]} fainted!`)
                        if(shinxes[i].gainExperience(shinxes[(i+1)%2].level)) message.channel.send(`${nicks[i]} grew to level ${shinxes[i].level}!`)
                        for(let i = 0; i < 2; i++) await bank.currency.updateShinx(shinxes[i])
                        message.channel.send(`${shinxes[i].owner.username} won the battle!`)
                        return 
                    } 
                } 
                
            }
            for(let i = 0; i < 2; i++) shinxes[i].checks()
        }
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};