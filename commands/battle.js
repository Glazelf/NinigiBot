const { Users } = require('../database/dbObjects');
const ShinxBattle = require('../shinx/shinxBattle')
const colors = ['green', 'yellow', 'orange', 'red', 'purple']

const addLine = (line) =>{
    return (line+'\n')
}

const wait = () => new Promise(resolve => setTimeout(resolve, 5000));

module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const Canvas = require('canvas');
        const hp = require('../util/getHP');
        const { bank } = require('../database/bank');
        const Discord = require("discord.js");
        const input = message.content.slice(1).trim();
        const [, , target] = input.match(/(\w+)\s*([\s\S]*)/);
        if(target.length<1) return message.channel.send('Please specify a user to battle.')
        const trainers = [message.author, message.mentions.users.first()]
        if(trainers[0].id===trainers[1].id) return message.channel.send('You cannot battle yourself!')
        if(globalVars.battling.yes) return message.channel.send('Theres already a battle on course.')
        shinxes = []
        for(let i = 0; i < 2; i++) {
            const shinx = await bank.currency.getShinx(trainers[i].id)
            shinx.see();
            if(shinx.sleeping) return message.channel.send('At least one of the participants is asleep.');
            const user = await Users.findOne({ where: { user_id: trainers[i].id } });
            const equipments = await user.getEquipments();
            shinxes.push(new ShinxBattle(trainers[i], shinx, equipments))
        } 
        await message.channel.send(`${trainers[1]} do you accept the challenge? (y\\n)`)
        const accepts = await message.channel.awaitMessages(m=>m.author.id==trainers[1].id,{max:1, time:10000})
        if(!accepts.first()||!'yes'.includes(accepts.first().content.toLowerCase())) return message.channel.send(`Battle cancelled.`)
        if(globalVars.battling.yes) return message.channel.send('Theres already a battle on course.')
        globalVars.battling.yes = true;
        let text='';
        const avatars = [trainers[0].displayAvatarURL({ format: 'jpg' }), trainers[1].displayAvatarURL({ format: 'jpg' })]
        
        let canvas = Canvas.createCanvas(240, 71);
        let ctx = canvas.getContext('2d');
        let background = await Canvas.loadImage('./assets/vs.png');
        ctx.drawImage(background, 0, 0);
        ctx.beginPath();
        for(let i = 0; i < 2; i++) ctx.arc(47+147*i, 36, 29, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.clip();
        for(let i = 0; i < 2; i++) {
            const avatar = await Canvas.loadImage(avatars[i]);
            ctx.drawImage(avatar, 18+147*i, 7, 58, 58);
        }
        await message.channel.send(new Discord.MessageAttachment(canvas.toBuffer()));
    
	
        canvas = Canvas.createCanvas(240, 168);
        ctx = canvas.getContext('2d');
        background = await Canvas.loadImage('./assets/battleUI.png');
        ctx.drawImage(background, 0, 0);
        ctx.font = 'normal bolder 14px Arial';
        ctx.fillStyle = '#FFFFFF';
        for(let i = 0; i < 2; i++) ctx.fillText(trainers[i].username, 53+49*i, 49+79*i);
        
        
        const battleSprite = await Canvas.loadImage('./assets/battleSprite.png');
        
        for(let i = 0; i < 2; i++) if(shinxes[i].shiny) ctx.drawImage(battleSprite, 39*i, 0, 39, 26, (12+177*i), 24+79*i, 39, 26 );
        const nicks = []
        const prevColors = [0, 0]
        for(let i = 0; i < 2; i++) shinxes[i].nick.trim().toLowerCase()==='shinx'? nicks.push(`${shinxes[i].owner.username}'s shinx`):nicks.push(shinxes[i].nick) 
        const geasson = await Canvas.loadImage('./assets/geasson.png');
        const geassoff =await Canvas.loadImage('./assets/geassoff.png');
        for(let i = 0; i<2; i++){
            if(shinxes[i].supergeass||shinxes[i].geass>0){
                text += addLine(`**...?**\nThe power of love remains!\n**${nicks[i]} entered geass mode!**` )
                ctx.drawImage(geasson, 52+35*i, 20+79*i);
                ctx.font = 'normal bolder 14px Arial';
                ctx.fillStyle = '#fc03c2';
                ctx.fillText(trainers[i].username, 53+49*i, 49+79*i);
            }
        }
        if(text.length>0) message.channel.send(text)
        while(true){
            text = '';            
            for(let i = 0; i < 2; i++){
                const attackMove = shinxes[i].attack();
                text += addLine( `${nicks[i]} uses ${attackMove[0]}!` )
                const result = shinxes[(i+1)%2].takeDamage(attackMove)    
                if (result===true){
                    canvas = Canvas.createCanvas(240, 130);
                    ctx = canvas.getContext('2d');
                    background = await Canvas.loadImage('./assets/results.png');
                    ctx.drawImage(background, 0, 0);
                    ctx.beginPath();
                    for(let i = 0; i < 2; i++) ctx.arc(58+134*i, 83, 40, 0, Math.PI * 2, false);
                    ctx.closePath();
                    ctx.clip();
                    for(let i = 0; i < 2; i++) {
                        const avatar = await Canvas.loadImage(avatars[(i+1)%2]);
                        ctx.drawImage(avatar, 18+134*i, 43, 80, 80);
                    }
                    text += addLine( `${nicks[(i+1)%2]} fainted!`)
                    for(let h = 0; h < 2; h++) {
                        if(shinxes[h].gainExperience(shinxes[(h+1)%2].level, i!==h)) {
                            text += addLine(`${nicks[h]} grew to level ${shinxes[h].level}!`)
                            const reward = await require('../shinx/levelRewards')(shinxes[h]);
                            if(reward)  text +=  addLine( `You got a new ${reward[0]}: ${reward[1]}!`)
                        }
                    }
                    
                    for(let p = 0; p < 2; p++) await bank.currency.updateShinx(shinxes[p], p===i)
                    globalVars.battling.yes = false;
                    return message.channel.send(text, new Discord.MessageAttachment(canvas.toBuffer()))
                } else{
                    if(result===-1){
                        text += addLine(`${nicks[i]} lost his shield by blocking a deathblow!`)
                    }   
                }
            }

            const hps = [hp(shinxes[0].percent), hp(shinxes[1].percent)]
            for(let i = 0; i<2; i++){
                if(!isNaN(hps[i][0])){
                    const color = hps[i][0]
                    if(color>2&& prevColors[i]<=color-1){
                        ctx.fillStyle = colors[color-1];
                        ctx.fillRect(38+90*i, 58+78*i, 96, 4)
                    }
                    ctx.fillStyle = colors[color];
                    ctx.fillRect(38+90*i, 58+78*i, hps[i][1], 4)
                    prevColors[i] = color
                }
                if(shinxes[i].geassMode()){
                    text += addLine( `**...?**\nThe power of love remains!\n**${nicks[i]} entered geass mode!**` )
                    ctx.drawImage(geasson, 52+35*i*i, 20+79*i);
                    ctx.font = 'normal bolder 14px Arial';
                    ctx.fillStyle = '#fc03c2';
                    ctx.fillText(trainers[i].username, 53+49*i, 49+79*i);
                } 
                if(shinxes[i].reduceGeass()) {
                    text += addLine( `**${nicks[i]} no longer has geass mode!**` )
                    ctx.drawImage(geassoff, 52+35*i*i, 20+79*i);
                    ctx.font = 'normal bolder 14px Arial';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(trainers[i].username, 53+49*i, 49+79*i);
                }
                if(shinxes[i].applyRegen()){
                    text += addLine( `${nicks[i]} recovered some health!`)
                }
            }
            message.channel.send(text, new Discord.MessageAttachment(canvas.toBuffer()));
            await wait();
        }
    } catch (e) {
        // log error
        console.log(e);
        globalVars.battling.yes = false;

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};