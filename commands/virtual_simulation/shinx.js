const Canvas = require('canvas');

const Discord = require('discord.js');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        
        const shinxApi = require('../../database/dbServices/shinx.api');

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        if (ephemeralArg === false) ephemeral = false;

        //await interaction.deferReply({ ephemeral: ephemeral });
        let shinx, foodArg, res, avatar;

        let canvas, ctx, img;
        let userFinder = await interaction.guild.members.fetch();
        let messageFile = null;
        let time;
        const applyText = require('../../util/shinx/applyCanvasText');
        const now = new Date();
        let master = interaction.user;

        // Auto feed
        let auto_feed = await shinxApi.getShinxAutofeed(master.id);
        if (auto_feed > 0) {
            if (auto_feed == 1) {
                await shinxApi.autoFeedShinx1(master.id);
            } else {
                await shinxApi.autoFeedShinx2(master.id);
            };
        };

        switch (interaction.options.getSubcommand()) {
            case "info":
                shinx = await shinxApi.getShinx(master.id);
                const is_user_male = shinx.user_male;

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
                ctx.drawImage(img, 59 * !is_user_male, 71, 59 - 5 * !is_user_male, 49, 403, 125, 59 - 5 * !is_user_male, 49);
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
                ctx.fillText(shinx.getBellyPercent(), 621, 288);
                const exp_struct = shinx.getNextExperience();
                ctx.fillText(exp_struct.exp_pts, 621, 393);
                ctx.fillText(shinx.meetup, 490, 218);
                const belly_prop = shinx.getBellyProportion();
                if (belly_prop > 0) {
                    ctx.fillStyle = require('../../util/shinx/getBelly')(shinx.getBellyProportion());
                    ctx.fillRect(467, 308, 245 * belly_prop, 14);
                };

                if (exp_struct.curr_percent > 0) {
                    ctx.fillStyle = '#00d4a8'
                    ctx.fillRect(467, 413, 245 * exp_struct.curr_percent, 14);
                };

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, files: messageFile, ephemeral: ephemeral });
            case "feed":
                foodArg = interaction.options.getInteger("food");
                res = await shinxApi.feedShinx(master.id);
                switch (res) {
                    case 'NoHungry':
                        returnString = `Shinx is not hungry!`;
                        break;
                    case 'NoFood':
                        returnString = `Not enough food\nTip: you can buy more using \`/buyfood\``;
                        break;
                    case 'Ok':
                        reaction = require('../../util/shinx/getRandomEatingReaction')();
                        shinx = await shinxApi.getShinx(master.id);
                        returnString = `**${shinx.nickname}** ${reaction[0]}`;
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
                    ephemeral: ephemeral || (res != 'Ok')
                });
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
                if (shinx.belly < 0.2) {
                    reaction = playing_reaction(0);
                } else {
                    reaction = playing_reaction();
                };

                img = await Canvas.loadImage('./assets/reactions.png');
                ctx.drawImage(img, 10 + 30 * reaction[1], 8, 30, 32, 120, 212, 30, 32);
                shinx.addExperienceAndUnfeed(100 * reaction[2], 1);
                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: `**${shinx.nickname}** ${reaction[0]}`,
                    files: messageFile,
                    ephemeral: ephemeral
                });
                break;
            case "talk":
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
                shinx.addExperienceAndUnfeed(50, 1);
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: `**${shinx.nickname}** ${conversation.quote}`,
                    files: messageFile,
                    ephemeral: ephemeral
                });
                break;
            case "nick":
                let new_nick = interaction.options.getString("nickname");
                res = await shinxApi.nameShinx(master.id, new_nick);
                messageFile = null;
                switch (res) {
                    case 'TooShort':
                        returnString = `Could not rename because provided nickname was empty`;
                        break;
                    case 'TooLong':
                        returnString = `Could not rename because provided nickname length was greater than 12`;
                        break;
                    case 'InvalidChars':
                        returnString = `Could not rename because provided nickname was not alphanumeric`;
                        break;
                    case 'Ok':
                        if (ephemeralArg === false) ephemeral = true;
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
                };

                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: returnString,
                    files: messageFile,
                    ephemeral: ephemeral || (res != 'Ok')
                });

            case "shiny":
                res = await shinxApi.hasEventTrophy(master.id, 'shiny charm');
                if (res) {
                    const is_shiny = await shinxApi.switchShininessAndGet(master.id);
                    returnString = is_shiny ? `Your shinx is shiny now` : `Your shinx is no longer shiny`;
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
                    returnString = 'You need that your shinx arrives to level 50 for that.';
                    messageFile = null;
                };
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: returnString,
                    files: messageFile,
                    ephemeral: ephemeral || (res != true)
                });

            case "release":
                let confirm = false
                let confirmArg = interaction.options.getBoolean("confirm");
                if (confirmArg === true) confirm = confirmArg;
                if (!confirm) return sendMessage({ client: client, interaction: interaction, content: `This action is irreversible and will reset all your Shinx's values.\nPlease set the \`confirm\` option for this command to \`true\` if you're sure.` });
                shinx = await shinxApi.getShinx(master.id);
                await shinx.destroy();

                return sendMessage({ client: client, interaction: interaction, content: `Released Shinx and reset all it's values.` });
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
        name: "info",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "See your shinx!",
        options: [{
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "feed",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Feed Shinx!"
    }, {
        name: "play",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Play with your shinx!",
        options: [{
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "talk",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Talk with your shinx!",
        options: [{
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "nick",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Change your Shinx nickname!",
        options: [{
            name: "nickname",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Alphanumeric string (between 1 and 12 characters)",
            required: true
        }]
    }, {
        name: "shiny",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Change Shinx's color!"
    }, {
        name: "release",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Release Shinx.",
        options: [{
            name: "confirm",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Are you sure? You can never get this Shinx back."
        }]
    }]
};