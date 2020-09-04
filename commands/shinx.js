const Canvas = require('canvas');

const reactions = [
    //['',0],
    ['thinks manetric should not exist.',6],
    ['read the final chapter of the Yoomking and is confused about the ending',2],
    ['thinks you are cute',14],
    ['thinks that if you don\'t love yourself how the hell are you gonna love somebody else?',6],
    ['got this new anime plot, basically...',4],
    ['is sad because of Yanderedev code',0],
    ['thinks that you should follow Glaze on Twitch if you don\'t already',6],
    ['thinks that you should donate to Glaze\'s Paypal',6],
    ['is worried about how far the sun is',0],
    ['got hit by a pidgey. Oof!',2],
    ['got scared of that spinarank on your head!',3],
    ['is thinking about chocolate. Ahhh sweet',4],
    ['told a joke. Seems to be funny (?)', 5],
    ['doesnt\'t want you to have a girlfriend.',6],
    ['is sad because people on this world are bad.',7],
    ['wants 500 euros now. Damn.',8],
    ['watched Bambie tonight and now is crying',9],
    ['is sorry about biting your shoes',10],
    ['wants a remake of Pokemon Platinum...',11],
    ['wants love hes no longer asking',12],
    ['is trying to solve some equation',13],
    ['got happy just because you smiled',14],
    ['is happy to be alive',15],
    ['thinks you should be doing your homework',6],
    ['wants you to play The Legend of Heroes: Trails of Cold Steel',15],
    ['watched Code Geass and is crying about the ending. Again.',7],
    ['is singing something? ...? What was that? Dango?',14],
    ['lost on VGC so hes rage quitting like a real japanese player',12],
    ['looks a bit horny. Ohh boy, post that on the correct channel! ',3]


]

const taping = [
 
    ['is sleeping. Shh!', 1, 'a'],
    ['has no energy at all.', 3,  1],
    ['feels a bit sleepy', 4,  3],
    ['doesn\'t seem to want to sleep now',8, 4],
    ['has more energy than ever!', 8,  0]

]

const eating = 
[
    ['seems to like the food!', 3 ],
    ['is in love with this food!', 2 ],
    ['seems to be thinking about something while eating...', 1 ],
    ['is full. Finish your plate, cutie!', 8 ],
]

const playing = 
[
    ['Doesn\'t feel prety well...', 8, 0 ],
    ['likes the fresh air here!', 3, 1 ],
    ['is so happy about seeing his friends!', 2, 1.2 ],
    ['seems to be singing something!', 0, 0.9],
    ['seems a bit shy with those shinxes. Oh boy...', 8, 0.4]
    //['']
]

const visitors = [
    //[[[mc.facing, mc.x , mc.y],[shinx.facing, shinx.x , shinx.y]], ...]
    [[[2, 294, 171],[8, 290, 254]], [[3, 417, 121],[7, 479, 145]]],
    [[[0, 334, 238],[6, 388, 263]], [[2, 512, 238],[8, 455, 263]]],
    [[[0, 435, 278],[8, 496, 302]], [[3, 361, 125],[7, 295, 150]], [[3, 425, 125],[7, 486, 150]]],
    [[[1, 368, 134],[6, 362, 236]], [[1, 435, 134],[8, 436, 236]]],
]




module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const { bank } = require('../database/bank');
        const Discord = require("discord.js");
        const args = message.content.slice(1).trim().split(/ +/);
        args.shift();
        const shinx = await bank.currency.getShinx(message.author.id)
        shinx.see();
        let canvas, ctx, img;
        const now = new Date();
    
        if(args[0]==='gender') return shinx.trans()? message.channel.send('Now you are Lucas!'):message.channel.send('Now you are Dawn!')
        if(args[0]==='level') return message.channel.send(`Shinx levels up to level ${shinx.levelUp(1)}`); 
        if(args[0]=='data'){
            canvas = Canvas.createCanvas(791, 541);
            ctx = canvas.getContext('2d');
            img = await Canvas.loadImage('./assets/data.png');
        
            ctx.drawImage(img, 0, 0);
            if(shinx.shiny){
                const cap = await Canvas.loadImage('./assets/shiny.png');
                ctx.drawImage(cap, 97, 202);
            }
            img = await Canvas.loadImage('./assets/owner.png');
            ctx.drawImage(img, 48*!shinx.user_male, 0, 47+9*!shinx.user_male , 70, 407, 427, 47+9*!shinx.user_male , 70);
            ctx.drawImage(img, 59*!shinx.user_male, 71, 59-5*!shinx.user_male, 49, 398, 156, 59-5*!shinx.user_male, 49 );
            ctx.font = 'normal bolder 45px Arial';
            ctx.fillStyle = '#FFFFFF';
            
            ctx.fillText(shinx.nick, 88, 133);
            ctx.font = 'normal bolder 35px Arial';
            if(shinx.user_male) ctx.fillStyle = '#0073FF'
            else ctx.fillStyle = 'red'
            ctx.fillText(message.author.username, 490, 190);
            ctx.fillStyle = '#000000'
            ctx.fillText(shinx.level, 93, 180);
            ctx.fillText(Math.floor(shinx.hunger*100)+'%', 490, 251);
            ctx.fillText(Math.floor(shinx.sleep*100)+'%', 490, 310);
            ctx.fillText(Math.floor(shinx.friendship*100)+'%', 490, 364);
            ctx.fillText(shinx.meetup, 490, 481);
            ctx.fillText(shinx.equipment[0].toUpperCase()+shinx.equipment.slice(1), 15, 530);
            if(shinx.sleeping){
                img = await Canvas.loadImage('./assets/sleepicon.png');
                ctx.drawImage(img, 270,155);
            }
            return message.channel.send(new Discord.MessageAttachment(canvas.toBuffer(), 'data.png'));
        }else if(args[0]=='tap'||shinx.sleeping){
            if(!shinx.sleeping){
                const fallsAsleep = Math.random()<=Math.max(0, 1-1.5*shinx.sleep)
                if(fallsAsleep) shinx.rest();
            }
            canvas = Canvas.createCanvas(468, 386);
            ctx = canvas.getContext('2d');
            img = await Canvas.loadImage('./assets/room.png');
            ctx.drawImage(img, 0, 0);
            img = await Canvas.loadImage('./assets/mc.png');
            ctx.drawImage(img, 51*!shinx.user_male, 0, 51, 72, 188, 148, 51, 72);
            img = await Canvas.loadImage('./assets/fieldShinx.png');
            let reaction;
            if(shinx.sleeping) reaction = taping[0]
            else if(shinx.sleep<0.1) reaction = taping[1]
            else if(shinx.sleep<0.3) reaction = taping[2]
            else if(shinx.sleep<0.5) reaction = taping[3]
            else reaction = taping[4]

            ctx.drawImage(img,57*reaction[1], 48*shinx.shiny,  57, 48, 284, 177,  57, 48); 
            if(!isNaN(reaction[2])){
                img = await Canvas.loadImage('./assets/reactions.png');
                ctx.drawImage(img, 10+30*reaction[2], 8, 30, 32, 289, 147, 30, 32)
            }
            if(now.getHours()> 20||now.getHours()<4){
                img = await Canvas.loadImage('./assets/winNight.png');
                ctx.drawImage(img, 198, 52);
            }
            return message.channel.send(`${shinx.nick} ${reaction[0]}`, new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png'))
        
        }
        else if(args[0]==='nick'){
            args.shift()
            
            const nickname = args.join(' ') 
            if(nickname.length<1||nickname.lenght>10) return  message.channel.send(`Please specify a valid nickname between 1 and 10 characters.`);
            shinx.changeNick(nickname)

            canvas = Canvas.createCanvas(471, 355);
            ctx = canvas.getContext('2d');
            img = await Canvas.loadImage('./assets/nicks.png');
            ctx.drawImage(img, 0, 0);
            img = await Canvas.loadImage('./assets/mc.png');
            ctx.drawImage(img, 51*!shinx.user_male, 72*0, 51, 72, 270, 200, 51, 72);
            img = await Canvas.loadImage('./assets/fieldShinx.png');
            ctx.drawImage(img, 57*8, 48*shinx.shiny, 57, 48, 324, 223, 57, 48);
            img = await Canvas.loadImage('./assets/reactions.png');
            ctx.drawImage(img, 10+30*4, 8, 30, 32, 335, 192, 30, 32)
            const text = `Nickname changed to ${nickname}!`;
            return message.channel.send(text, new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png'))

        }if(args[0]==='shiny'){
            const { Users } = require('../database/dbObjects'); 
            const user = await Users.findOne({ where: { user_id: message.author.id } });
            const keys = await user.getKeys();
            if(!keys) return 
            const shinyCharm = keys.filter(i => i.key.name.toLowerCase() === 'shiny charm');
            if(shinyCharm.length<1) return 
            canvas = Canvas.createCanvas(255, 192);
            ctx = canvas.getContext('2d');
            img = await Canvas.loadImage('./assets/sky.png');
            ctx.drawImage(img, 0, 0);
            img = await Canvas.loadImage('./assets/sprite.png');
            ctx.drawImage(img,94*!shinx.shiny, 0,  94, 72, 87, 61,  94, 72); 
            if(!shinx.shiny){
                img = await Canvas.loadImage('./assets/sparkle.png');
                ctx.drawImage(img, 49, 10 ); 
            }
            const text = shinx.shine()? 'Now your shinx shines!':'Your shinx doesnt shine anymore';
            return message.channel.send(text, new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png'))
        }
        else if(args[0]=='equip'){
            const { Users } = require('../database/dbObjects');
            args.shift()
            const equipmentName = args.join(' ') 

            const user = await Users.findOne({ where: { user_id: message.author.id } });
            const equipments = await user.getEquipments();
            if(!equipments) return message.channel.send(`> You don't have any equipment, ${message.author}.`);
            const equipment = equipments.filter(i => i.equipment.name.toLowerCase() === equipmentName.toLowerCase());
            if(equipment.length<1) return message.channel.send(`> You don't have that equipment, ${message.author}.`);
            shinx.equip(equipment[0].equipment.name)

            canvas = Canvas.createCanvas(428, 310);
            ctx = canvas.getContext('2d');
            img = await Canvas.loadImage('./assets/frontier.png');
            ctx.drawImage(img, 0, 0);
            img = await Canvas.loadImage('./assets/mc.png');
            ctx.drawImage(img, 51*!shinx.user_male, 72*0, 51, 72, 162, 123, 51, 72);
            img = await Canvas.loadImage('./assets/fieldShinx.png');
            ctx.drawImage(img, 57*8, 48*shinx.shiny, 57, 48, 217, 147, 57, 48);
            img = await Canvas.loadImage('./assets/reactions.png');
            ctx.drawImage(img, 10+30*0, 8, 30, 32, 230, 117, 30, 32)
            const text = `Equipment changed to ${equipmentName}!`;
            return message.channel.send(text, new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png'))
        }
        else if(args[0]=='feed'){
            const { Users } = require('../database/dbObjects');
            args.shift()
            const foodName = args.join(' ') 

            const user = await Users.findOne({ where: { user_id: message.author.id } });
            const foods = await user.getFoods();
            if(!foods) return message.channel.send(`> You don't have any food to give, ${message.author}.`);
            const food = foods.filter(i => i.food.name.toLowerCase() === foodName.toLowerCase());
            if(food.length<1) return message.channel.send(`> You don't have that food, ${message.author}.`);
            user.removeFood(food[0]);
            shinx.feed(food[0].food.recovery)
            
            canvas = Canvas.createCanvas(393, 299);
            ctx = canvas.getContext('2d');
            img = await Canvas.loadImage('./assets/dining.png');
            ctx.drawImage(img, 0, 0);
            img = await Canvas.loadImage('./assets/mc.png');
            const guests = await bank.currency.getRandomShinx(2, shinx.user_id);
            const userFinder = message.guild.members.cache;
            ctx.drawImage(img, 51*!shinx.user_male, 0, 51, 72, 120, 126, 51, 72);
            ctx.font = 'normal bold 16px Arial';
            ctx.fillStyle = '#ffffff'
            for(let i=0; i<guests.length; i++){ 
                const nick = userFinder.get(guests[i].user_id).user.username.split(' ');
                ctx.drawImage(img, 51*!guests[i].user_male, 72*2, 51, 72, 298, 35+90*i, 51, 72);
                for(let k=nick.length-1; 0<=k;k--){
                    ctx.fillText(nick[k], 298, 35+90*i-15*(nick.length-1-k));
                }
                
            }
            img = await Canvas.loadImage('./assets/fieldShinx.png');
            ctx.drawImage(img, 57*7, 48*shinx.shiny,57, 48, 188, 150, 57, 48)
            for(let i=0; i<guests.length; i++){
                ctx.drawImage(img, 57*(5+2*i), 48*guests[i].shiny, 57, 48, 234, 49+100*i, 57, 48);
            }
            const reaction = eating[Math.floor(Math.random()*eating.length)];
            img = await Canvas.loadImage('./assets/reactions.png');
            ctx.drawImage(img, 10+30*reaction[1], 8, 30, 32, 202, 115, 30, 32)
            if(now.getHours()> 20||now.getHours()<6){
                img = await Canvas.loadImage('./assets/dinNight.png');
                ctx.drawImage(img, 199, 0);
            }
            return message.channel.send(`${shinx.nick} ${reaction[0]}`, new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png'));


        
        }else if(args[0]=='play'){
            canvas = Canvas.createCanvas(578, 398);
            ctx = canvas.getContext('2d');
            img = await Canvas.loadImage('./assets/landscapes.png');
            ctx.drawImage(img, 0, 0);
            const now = new Date();
            let time;
            if(now.getHours()>= 20||now.getHours()<4){
                time = 2;
            }else if(now.getHours()>= 4&&now.getHours()<10){
                time = 0;
            }else{
                time = 1;
            }
            ctx.drawImage(img, 578*time, 0, 578, 398, 0, 0, 578, 398);
            const layout = visitors[Math.floor(Math.random()*visitors.length)];
            const guests = await bank.currency.getRandomShinx(layout.length, shinx.user_id);
            const userFinder = message.guild.members.cache;
            img = await Canvas.loadImage('./assets/mc.png');
            ctx.drawImage(img, 51*!shinx.user_male, 72*0, 51, 72, 60, 223, 51, 72);
            ctx.font = 'normal bolder 18px Arial';
            ctx.fillStyle = 'purple'
            for(let i=0; i<guests.length; i++){ 
                const nick = userFinder.get(guests[i].user_id).user.username.split(' ');
                ctx.drawImage(img, 51*!guests[i].user_male, 72*layout[i][0][0], 51, 72, layout[i][0][1], layout[i][0][2], 51, 72);
                for(let k=nick.length-1; 0<=k;k--){
                    ctx.fillText(nick[k], layout[i][0][1], layout[i][0][2]-19*(nick.length-1-k));
                }
                
            }
            img = await Canvas.loadImage('./assets/fieldShinx.png');
            ctx.drawImage(img, 57*8, 48*shinx.shiny, 57, 48, 113, 245, 57, 48);
            for(let i=0; i<guests.length; i++){
                ctx.drawImage(img, 57*layout[i][1][0], 48*guests[i].shiny, 57, 48, layout[i][1][1], layout[i][1][2], 57, 48);
            }
            let reaction;
            if(shinx.sleep<0.2||shinx.hunger<0.2) reaction = playing[0]
            else reaction = playing[Math.floor(Math.random()*(playing.length-1))+1]
            img = await Canvas.loadImage('./assets/reactions.png');
            ctx.drawImage(img, 10+30*reaction[1], 8, 30, 32, 120, 212, 30, 32)
            shinx.play(reaction[2])
            return message.channel.send(`${shinx.nick} ${reaction[0]}`, new Discord.MessageAttachment(canvas.toBuffer(), 'park.png'));

        
        }else{
            canvas = Canvas.createCanvas(256, 160);
            ctx = canvas.getContext('2d');
            img = await Canvas.loadImage('./assets/park.png');
            ctx.drawImage(img, 0, 0);
            let time;
            if(now.getHours()>= 20||now.getHours()<4){
                time = 2;
            }else if(now.getHours()>= 4&&now.getHours()<10){
                time = 0;
            }else{
                time = 1;
            }
            ctx.drawImage(img, 256*time, 0, 256, 160, 0, 0, 256, 160);
            img = await Canvas.loadImage('./assets/trainer.png');
            ctx.drawImage(img, 172*!shinx.user_male, 0, 129+42*shinx.user_male, 108, 2, 52, 129+42*shinx.user_male, 108);
            img = await Canvas.loadImage('./assets/portraits.png');
            let reaction = reactions[Math.floor(Math.random()*reactions.length)]
            ctx.drawImage(img, 64*reaction[1], 64*shinx.shiny, 64, 64, 173, 68, 64, 64);
            return message.channel.send(`${shinx.nick} ${reaction[0]}`, new Discord.MessageAttachment(canvas.toBuffer(), 'talking.png'));

        }
        
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};