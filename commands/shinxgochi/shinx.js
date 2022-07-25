const Canvas = require('canvas');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const shinxApi = require('../../database/dbServices/shinx.api');
        const userApi = require('../../database/dbServices/user.api');
        
        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        await interaction.deferReply({ ephemeral: ephemeral });
        let shinx, embed,foodArg,res,avatar;

        let canvas, ctx, img;
        let userFinder = await interaction.guild.members.fetch();
        let messageFile = null;
        let time;
        const now = new Date();
        let master = interaction.user
        switch (interaction.options.getSubcommand()) {
            case "data":
                shinx = await shinxApi.getShinx(master.id);
                const is_user_male = shinx.user_male;
                const applyText = require('../../util/shinx/applyCanvasText')
                avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);

                canvas = Canvas.createCanvas(791, 441);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/data.png');

                ctx.drawImage(img, 0, 0);
                if (shinx.shiny) {
                    const cap = await Canvas.loadImage('./assets/shiny.png');
                    ctx.drawImage(cap, 97, 202);
                };

                img = await Canvas.loadImage('./assets/owner.png');
                ctx.drawImage(img, 59 * !is_user_male, 71, 59 - 5 * !is_user_male, 49, 403, 125,        59 - 5 * !is_user_male, 49);
                ctx.font = applyText(canvas, shinx.nickname, 45, 266);
                ctx.fillStyle = '#FFFFFF';

                ctx.fillText(shinx.nickname, 88, 133);
                ctx.font = applyText(canvas, master.username, 35, 228);

                if (shinx.user_male) {
                    ctx.fillStyle = '#0073FF';
                } else {
                    ctx.fillStyle = 'red';
                };

                ctx.fillText(master.username, 490, 153);
                ctx.font = 'normal bolder 35px Arial';
                ctx.fillStyle = '#000000';
                ctx.fillText(shinx.getLevel(), 93, 180);
                ctx.fillText(shinx.getFullnessPercent(), 621, 288);
                const exp_struct = shinx.getNextExperience();
                ctx.fillText(exp_struct.exp_pts, 621, 393);
                ctx.fillText(shinx.meetup, 490, 218);
                const fullness_prop = shinx.getFullnessProportion();
                if(fullness_prop>0){
                    ctx.fillStyle = require('../../util/shinx/getBelly')(shinx.getFullnessProportion());
                    ctx.fillRect(467, 308, 245*fullness_prop, 14);
                }
                
                if(exp_struct.curr_percent>0){
                    ctx.fillStyle = '#00d4a8'
                    ctx.fillRect(467, 413, 245*exp_struct.curr_percent, 14);
                }
                

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, files: messageFile });

                // embed = new Discord.MessageEmbed()
                // .setColor(globalVars.embedColor)
                // .setTitle(`${master.username}'s Shinx`)
                // .addFields(
                //     { name: "Nickname:", value: shinx.nickname.toString()},
                //     { name: "Level:", value: shinx.getLevel().toString(), inline: true},
                //     { name: "Next Level:", value: `${shinx.getNextExperience()} pts.`, inline: true},
                //     { name: '\u200B', value: '\u200B', inline: true },
                //     { name: "Fullness:", value: shinx.getFullnessPercent(), inline: true},
                // )
                // let file;
                // if(shinx.shiny){
                //     file = new Discord.MessageAttachment('./assets/shiny_shinx.png', 'shiny_shinx.png');
                //     embed.setThumbnail('attachment://shiny_shinx.png')
                // } else {
                //     file = new Discord.MessageAttachment('./assets/shinx.png', 'shinx.png');
                //     embed.setThumbnail('attachment://shinx.png')
                // }
                // return sendMessage({ 
                //     client: client, 
                //     interaction: interaction, 
                //     embeds: [embed],  
                //     files: [file],
                //     ephemeral: ephemeral });
            case "addexp":
                let expArg = interaction.options.getInteger("exp");
                await shinxApi.addExperience(master.id, expArg);
                returnString = `Added experience to your Shinx!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral });
            case "changenick":
                let new_nick = interaction.options.getString("nickname");
                res = await shinxApi.nameShinx(master.id, new_nick);
                messageFile = null;
                switch(res){
                    case 'TooShort':
                        returnString = `Could not rename because provided nickname was empty`;
                        break;
                    case 'TooLong':
                        returnString = `Could not rename because provided nickname length was greater than 12`
                        break;
                    case 'InvalidChars':
                        returnString = `Could not rename because provided nickname was not alphanumeric`
                        break;
                    case 'Ok':
                        is_shiny = await shinxApi.getShinxShininess(master.id);
                        canvas = Canvas.createCanvas(471, 355);
                        ctx = canvas.getContext('2d');
                        img = await Canvas.loadImage('./assets/nicks.png');
                        ctx.drawImage(img, 0, 0);
                        img = await Canvas.loadImage('./assets/mc.png');
                        const is_user_male = await shinxApi.isTrainerMale(master.id);
                        ctx.drawImage(img, 51 * !is_user_male, 72 * 0, 51, 72, 270, 200, 51, 72);
                        img = await Canvas.loadImage('./assets/fieldShinx.png');
                        ctx.drawImage(img, 57 * 8, 48 * is_shiny, 57, 48, 324, 223, 57, 48);
                        img = await Canvas.loadImage('./assets/reactions.png');
                        ctx.drawImage(img, 10 + 30 * 4, 8, 30, 32, 335, 192, 30, 32);
                        returnString = `Nickname changed to **${new_nick}**!`;
                        messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                        break;
                }

                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    files: messageFile,
                    ephemeral: ephemeral });


            case "shiny":
                res = await shinxApi.hasShinxTrophy(master.id, 'shiny charm');
                if(res){
                    const is_shiny = await shinxApi.switchShininessAndGet(master.id)
                    returnString = is_shiny? `Your shinx is shiny now` : `Your shinx is no longer shiny`
                    canvas = Canvas.createCanvas(255, 192);
                    ctx = canvas.getContext('2d');
                    img = await Canvas.loadImage('./assets/sky.png');
                    ctx.drawImage(img, 0, 0);
                    img = await Canvas.loadImage('./assets/sprite.png');
                    ctx.drawImage(img, 94 * is_shiny, 0, 94, 72, 87, 61, 94, 72);
                    if (is_shiny) {
                        img = await Canvas.loadImage('./assets/sparkle.png');
                        ctx.drawImage(img, 49, 10);
                    };
                    messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                } else {
                    returnString = 'You need that your shinx arrives to level 50 for that.' 
                    messageFile = null;   
                }
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    files:messageFile,
                    ephemeral: ephemeral }); 
            case "feed":
                foodArg = interaction.options.getInteger("food");
                res = await shinxApi.feedShinx(master.id);  
                switch(res){
                    case 'NoHungry':
                        returnString = `Shinx is not hungry!`;
                        break;
                    case 'NoFood':
                        returnString = `You don't have enough food!`
                        break;
                    case 'Ok':
                        reaction = require('../../util/shinx/getRandomEatingReaction')();
                        shinx = await shinxApi.getShinx(master.id);
                        returnString = `**${shinx.nickname}** ${reaction[0]}`
                        canvas = Canvas.createCanvas(393, 299);
                        ctx = canvas.getContext('2d');
                        img = await Canvas.loadImage('./assets/dining.png');
                        ctx.drawImage(img, 0, 0);
                        img = await Canvas.loadImage('./assets/mc.png');
                        guests = await shinxApi.getRandomShinx(2, shinx.user_id, interaction.guild);
                        ctx.drawImage(img, 51 * !shinx.user_male, 0, 51, 72, 120, 126, 51, 72);
                        ctx.font = 'normal bold 16px Arial';
                        ctx.fillStyle = '#ffffff';
                        
                        for (let i = 0; i < guests.length; i++) {
                            const nick = userFinder.get(guests[i].user_id).user.username.split(' ');
                            ctx.drawImage(img, 51 * !guests[i].user_male, 72 * 2, 51, 72, 298, 35 + 90 * i, 51, 72);
                            for (let k = nick.length - 1; 0 <= k; k--) {
                                ctx.font = applyText(canvas, nick[k], 16, 51);
                                ctx.fillText(nick[k], 298, 35 + 90 * i - 15 * (nick.length - 1 - k));
                            };
                        };

                        img = await Canvas.loadImage('./assets/fieldShinx.png');
                        ctx.drawImage(img, 57 * 7, 48 * shinx.shiny, 57, 48, 188, 150, 57, 48);

                        for (let i = 0; i < guests.length; i++) {
                            ctx.drawImage(img, 57 * (5 + 2 * i), 48 * guests[i].shiny, 57, 48, 234, 49 + 100 * i, 57, 48);
                        };

                        
                        img = await Canvas.loadImage('./assets/reactions.png');
                        ctx.drawImage(img, 10 + 30 * reaction[1], 8, 30, 32, 202, 115, 30, 32);

                        if (now.getHours() > 20 || now.getHours() < 6) {
                            img = await Canvas.loadImage('./assets/dinNight.png');
                            ctx.drawImage(img, 199, 0);
                        };
                        
                        messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                        break;
                };
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: returnString, 
                    files: messageFile,
                    ephemeral: ephemeral });
            case "tap":
                shinx = await shinxApi.getShinx(master.id);
                canvas = Canvas.createCanvas(468, 386);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/room.png');
                ctx.drawImage(img, 0, 0);
                img = await Canvas.loadImage('./assets/mc.png');
                ctx.drawImage(img, 51 * !shinx.user_male, 0, 51, 72, 188, 148, 51, 72);
                img = await Canvas.loadImage('./assets/fieldShinx.png');
                reaction = require('../../util/shinx/getRandomSleepingReaction')();
                
                ctx.drawImage(img, 57 * reaction[1], 48 * shinx.shiny, 57, 48, 284, 177, 57, 48);

                if (!isNaN(reaction[2])) {
                    img = await Canvas.loadImage('./assets/reactions.png');
                    ctx.drawImage(img, 10 + 30 * reaction[2], 8, 30, 32, 289, 147, 30, 32);
                };
                
                if (now.getHours() > 20 || now.getHours() < 4) {
                    img = await Canvas.loadImage('./assets/winNight.png');
                    ctx.drawImage(img, 198, 52);
                };

                messageFile = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
                return sendMessage({ 
                    client: client,
                    interaction: interaction, 
                    content: `**${shinx.nickname}** ${reaction[0]}`, 
                    files: messageFile });
            case "play":
                shinx = await shinxApi.getShinx(master.id);
                canvas = Canvas.createCanvas(578, 398);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/landscapes.png');
                ctx.drawImage(img, 0, 0);
                if (now.getHours() >= 20 || now.getHours() < 4) {
                    time = 2;
                } else if (now.getHours() >= 4 && now.getHours() < 10) {
                    time = 0;
                } else {
                    time = 1;
                };
                ctx.drawImage(img, 578 * time, 0, 578, 398, 0, 0, 578, 398);
                const layout = require('../../util/shinx/getRandomVisitorPosition')();
                guests = await shinxApi.getRandomShinx(layout.length, shinx.user_id, interaction.guild);
                img = await Canvas.loadImage('./assets/mc.png');
                ctx.drawImage(img, 51 * !shinx.user_male, 72 * 0, 51, 72, 60, 223, 51, 72);
                ctx.font = 'normal bolder 18px Arial';
                ctx.fillStyle = 'purple';

                for (let i = 0; i < guests.length; i++) {
                    const nick = userFinder.get(guests[i].user_id).user.username.split(' ');
                    ctx.drawImage(img, 51 * !guests[i].user_male, 72 * layout[i][0][0], 51, 72, layout[i][0][1], layout[i][0][2], 51, 72);
                    for (let k = nick.length - 1; 0 <= k; k--) {
                        ctx.font = applyText(canvas, nick[k], 18, 51);
                        ctx.fillText(nick[k], layout[i][0][1], layout[i][0][2] - 19 * (nick.length - 1 - k));
                    };
                };

                img = await Canvas.loadImage('./assets/fieldShinx.png');
                ctx.drawImage(img, 57 * 8, 48 * shinx.shiny, 57, 48, 113, 245, 57, 48);

                for (let i = 0; i < guests.length; i++) {
                    ctx.drawImage(img, 57 * layout[i][1][0], 48 * guests[i].shiny, 57, 48, layout[i][1][1], layout[i][1][2], 57, 48);
                };
                const playing_reaction = require('../../util/shinx/getPlayingReaction')
                if (shinx.fullness < 0.2) {
                    reaction = playing_reaction(0);
                } else {
                    reaction = playing_reaction();
                };

                img = await Canvas.loadImage('./assets/reactions.png');
                ctx.drawImage(img, 10 + 30 * reaction[1], 8, 30, 32, 120, 212, 30, 32);
                shinx.addExperience(100 * reaction[2]);
                shinx.unfeed(1);
                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: `**${shinx.nickname}** ${reaction[0]}`, 
                    files: messageFile });
                break;
            case "park":
                shinx = await shinxApi.getShinx(master.id);
                canvas = Canvas.createCanvas(256, 160);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/park.png');
                ctx.drawImage(img, 0, 0);
                if (now.getHours() >= 20 || now.getHours() < 4) {
                    time = 2;
                } else if (now.getHours() >= 4 && now.getHours() < 10) {
                    time = 0;
                } else {
                    time = 1;
                };

                ctx.drawImage(img, 256 * time, 0, 256, 160, 0, 0, 256, 160);
                img = await Canvas.loadImage('./assets/trainer.png');
                ctx.drawImage(img, 172 * !shinx.user_male, 0, 129 + 42 * shinx.user_male, 108, 2, 52, 129 + 42 * shinx.user_male, 108);
                img = await Canvas.loadImage('./assets/portraits.png');
                let conversation = await shinxApi.getRandomReaction();
                ctx.drawImage(img, 64 * conversation.reaction, 64 * shinx.shiny, 64, 64, 173, 68, 64, 64);

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                shinx.addExperience(50);
                return sendMessage({ client: client, interaction: interaction, content: `**${shinx.nickname}** ${conversation.quote}`, files: messageFile });
                break;
        };
    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
module.exports.config = {
    name: "shinx",
    description: "Interact with your Shinx.",
    options: [{
        name: "data",
        type: "SUB_COMMAND",
        description: "See your shinx!",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },{
        name: "tap",
        type: "SUB_COMMAND",
        description: "Tap your shinx!",
    },{
        name: "play",
        type: "SUB_COMMAND",
        description: "Play with your shinx!",
    },{
        name: "park",
        type: "SUB_COMMAND",
        description: "Visit the National Park with shinx!",
    },{
        name: "battle",
        type: "SUB_COMMAND",
        description: "Battle your shinx!",
    },{
        name: "changenick",
        type: "SUB_COMMAND",
        description: "Change your Shinx nickname!",
        options: [{
            name: "nickname",
            type: "STRING",
            description: "Alphanumeric string (between 1 and 12 characters)",
            required: true
        }]
    },{
        name: "addexp",
        type: "SUB_COMMAND",
        description: "Add experience!",
        options: [{
            name: "exp",
            type: "INTEGER",
            description: "The amount of exp you want to add.",
            required: true,
        }]
    },{
        name: "feed",
        type: "SUB_COMMAND",
        description: "Feed Shinx!"
    },{
        name: "shiny",
        type: "SUB_COMMAND",
        description: "Change shinx's color!"
    }],
};