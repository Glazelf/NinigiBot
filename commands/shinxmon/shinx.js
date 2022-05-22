const Canvas = require('canvas');

const tapping = [
    ['is sleeping. Shh!', 1, 'a'],
    ['woke up! He wanted to sleep more...', 4, 8],
    ['! Time to wake up!', 8, 4]
];

const eating =
    [
        ['seems to like the food!', 3],
        ['is in love with this food!', 2],
        ['seems to be thinking about something while eating...', 1],
        ['is full. Finish your plate, cutie!', 8],
    ];
const applyText = (canvas, text, baseSize, limit) => {
    const ctx = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = baseSize + 5;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = `normal bolder ${fontSize -= 4}px Arial`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > limit);

    // Return the result to use in the actual canvas
    return ctx.font;
};

const playing =
    [
        ['doesn\'t feel well...', 8, 0],
        ['likes the fresh air here!', 3, 1],
        ['is so happy about seeing his friends!', 2, 1.2],
        ['seems to be singing something!', 0, 0.9],
        ['seems a bit shy with those other Shinxes. Oh boy...', 8, 0.4]
        //['']
    ];

const visitors = [
    //[[[mc.facing, mc.x , mc.y],[shinx.facing, shinx.x , shinx.y]], ...]
    [[[2, 294, 171], [8, 290, 254]], [[3, 417, 121], [7, 479, 145]]],
    [[[0, 334, 238], [6, 388, 263]], [[2, 512, 238], [8, 455, 263]]],
    [[[0, 435, 278], [8, 496, 302]], [[3, 361, 125], [7, 295, 150]], [[3, 425, 125], [7, 486, 150]]],
    [[[1, 368, 134], [6, 362, 236]], [[1, 435, 134], [8, 436, 236]]],
];

exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        const { Users } = require('../../database/dbObjects');
        const Discord = require("discord.js");

        let master = interaction.user
        let shinx = await bank.currency.getShinx(master.id);
        const user = await Users.findOne({ where: { user_id: master.id } });
        let userFinder = await interaction.guild.members.fetch();

        shinx.see();
        let canvas, ctx, img;
        const now = new Date();

        let subCommand = interaction.options.getSubcommand();
        if (shinx.sleeping) subCommand = "tap";
        let messageFile = null;
        let text = null;
        let reaction = null;
        let guests = null;
        let time = null;
        switch (interaction.options.getSubcommand()) {
            case "gender":
                return shinx.trans() ? sendMessage({ client: client, interaction: interaction, content: `Your character is now male, ${master}!` }) : sendMessage({ client: client, interaction: interaction, content: `Your character is now female, ${master}!` });
                break;
            case "data":
                canvas = Canvas.createCanvas(791, 541);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/data.png');

                ctx.drawImage(img, 0, 0);
                if (shinx.shiny) {
                    const cap = await Canvas.loadImage('./assets/shiny.png');
                    ctx.drawImage(cap, 97, 202);
                };

                img = await Canvas.loadImage('./assets/owner.png');
                ctx.drawImage(img, 48 * !shinx.user_male, 0, 47 + 9 * !shinx.user_male, 70, 407, 427, 47 + 9 * !shinx.user_male, 70);
                ctx.drawImage(img, 59 * !shinx.user_male, 71, 59 - 5 * !shinx.user_male, 49, 398, 156, 59 - 5 * !shinx.user_male, 49);
                ctx.font = applyText(canvas, shinx.nick, 45, 266);
                ctx.fillStyle = '#FFFFFF';

                ctx.fillText(shinx.nick, 88, 133);
                ctx.font = applyText(canvas, master.username, 35, 228);

                if (shinx.user_male) {
                    ctx.fillStyle = '#0073FF';
                } else {
                    ctx.fillStyle = 'red';
                };

                ctx.fillText(master.username, 490, 190);
                ctx.font = 'normal bolder 35px Arial';
                ctx.fillStyle = '#000000';
                ctx.fillText(shinx.level, 93, 180);
                ctx.fillText(Math.floor(shinx.hunger * 100) + '%', 490, 251);
                ctx.fillText(Math.floor(shinx.sleep * 100) + '%', 490, 310);
                ctx.fillText(Math.floor(shinx.friendship * 100) + '%', 490, 364);
                ctx.fillText(shinx.meetup, 490, 481);
                ctx.fillText(shinx.equipment[0].toUpperCase() + shinx.equipment.slice(1), 15, 530);

                if (shinx.sleeping) {
                    img = await Canvas.loadImage('./assets/sleepicon.png');
                    ctx.drawImage(img, 270, 155);
                };

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, files: messageFile });
                break;
            case "tap":
                shinx.rest();

                canvas = Canvas.createCanvas(468, 386);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/room.png');
                ctx.drawImage(img, 0, 0);
                img = await Canvas.loadImage('./assets/mc.png');
                ctx.drawImage(img, 51 * !shinx.user_male, 0, 51, 72, 188, 148, 51, 72);
                img = await Canvas.loadImage('./assets/fieldShinx.png');
                if (shinx.sleeping) {
                    reaction = tapping[0];
                } else if (shinx.sleep < 0.5) {
                    reaction = tapping[1];
                } else {
                    reaction = tapping[2];
                };

                ctx.drawImage(img, 57 * reaction[1], 48 * shinx.shiny, 57, 48, 284, 177, 57, 48);

                if (!isNaN(reaction[2])) {
                    img = await Canvas.loadImage('./assets/reactions.png');
                    ctx.drawImage(img, 10 + 30 * reaction[2], 8, 30, 32, 289, 147, 30, 32);
                };

                if (now.getHours() > 20 || now.getHours() < 4) {
                    img = await Canvas.loadImage('./assets/winNight.png');
                    ctx.drawImage(img, 198, 52);
                };

                let welcomeFile = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
                return sendMessage({ client: client, interaction: interaction, content: `**${shinx.nick}** ${reaction[0]}`, files: welcomeFile });
                break;
            case "nickname":
                const nickname = args.find(element => element.name == "name").value

                nickname.replace(/[^a-z]/gi, ''); // Remove non-alphabetical characters
                if (nickname.length < 2 || nickname.length > 10) return sendMessage({ client: client, interaction: interaction, content: `Please specify a valid nickname between 2 and 10 characters.` });
                shinx.changeNick(nickname);

                canvas = Canvas.createCanvas(471, 355);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/nicks.png');
                ctx.drawImage(img, 0, 0);
                img = await Canvas.loadImage('./assets/mc.png');
                ctx.drawImage(img, 51 * !shinx.user_male, 72 * 0, 51, 72, 270, 200, 51, 72);
                img = await Canvas.loadImage('./assets/fieldShinx.png');
                ctx.drawImage(img, 57 * 8, 48 * shinx.shiny, 57, 48, 324, 223, 57, 48);
                img = await Canvas.loadImage('./assets/reactions.png');
                ctx.drawImage(img, 10 + 30 * 4, 8, 30, 32, 335, 192, 30, 32);
                text = `Nickname changed to **${nickname}**!`;

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, content: text, files: messageFile });
                break;
            case "shiny":
                const keys = await user.getKeys();
                if (!keys) return;
                const shinyCharm = keys.filter(i => i.key.name.toLowerCase() === 'shiny charm');
                if (shinyCharm.length < 1) return sendMessage({ client: client, interaction: interaction, content: `You need a Shiny Charm to do this.` });
                canvas = Canvas.createCanvas(255, 192);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/sky.png');
                ctx.drawImage(img, 0, 0);
                img = await Canvas.loadImage('./assets/sprite.png');
                ctx.drawImage(img, 94 * !shinx.shiny, 0, 94, 72, 87, 61, 94, 72);

                if (!shinx.shiny) {
                    img = await Canvas.loadImage('./assets/sparkle.png');
                    ctx.drawImage(img, 49, 10);
                };

                text = shinx.shine() ? `Now your Shinx shines, ${master}!` : `Your Shinx doesnt shine anymore, ${master}.`;
                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, content: text, files: messageFile });
                break;
            case "equip":
                const equipmentName = args.find(element => element.name == "item").value.toLowerCase();
                const equipments = await user.getEquipments();
                if (!equipments) return sendMessage({ client: client, interaction: interaction, content: `You don't have any equipment, ${master}.` });
                const equipment = equipments.filter(i => i.equipment.name.toLowerCase() === equipmentName.toLowerCase());
                if (equipment.length < 1) return sendMessage({ client: client, interaction: interaction, content: `You don't have that equipment, ${master}.` });
                shinx.equip(equipment[0].equipment.name)

                canvas = Canvas.createCanvas(428, 310);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/frontier.png');
                ctx.drawImage(img, 0, 0);
                img = await Canvas.loadImage('./assets/mc.png');
                ctx.drawImage(img, 51 * !shinx.user_male, 72 * 0, 51, 72, 162, 123, 51, 72);
                img = await Canvas.loadImage('./assets/fieldShinx.png');
                ctx.drawImage(img, 57 * 8, 48 * shinx.shiny, 57, 48, 217, 147, 57, 48);
                img = await Canvas.loadImage('./assets/reactions.png');
                ctx.drawImage(img, 10 + 30 * 0, 8, 30, 32, 230, 117, 30, 32);
                text = `Equipment changed to ${equipmentName}!`;

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, content: text, files: messageFile });
                break;
            case "feed":
                const foodName = args.find(element => element.name == "food").value.toLowerCase();
                const foods = await user.getFoods();
                if (!foods) return sendMessage({ client: client, interaction: interaction, content: `You don't have any food, ${master}.` });
                const food = foods.filter(i => i.food.name.toLowerCase() === foodName.toLowerCase());
                if (food.length < 1) return sendMessage({ client: client, interaction: interaction, content: `You don't have that food, ${master}.` });
                user.removeFood(food[0]);
                shinx.feed(food[0].food.recovery);

                canvas = Canvas.createCanvas(393, 299);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/dining.png');
                ctx.drawImage(img, 0, 0);
                img = await Canvas.loadImage('./assets/mc.png');
                guests = await bank.currency.getRandomShinx(2, shinx.user_id, interaction.guild);
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

                reaction = eating[Math.floor(Math.random() * eating.length)];
                img = await Canvas.loadImage('./assets/reactions.png');
                ctx.drawImage(img, 10 + 30 * reaction[1], 8, 30, 32, 202, 115, 30, 32);

                if (now.getHours() > 20 || now.getHours() < 6) {
                    img = await Canvas.loadImage('./assets/dinNight.png');
                    ctx.drawImage(img, 199, 0);
                };

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, content: `**${shinx.nick}** ${reaction[0]}`, files: messageFile });
                break;
            case "play":
                canvas = Canvas.createCanvas(578, 398);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/landscapes.png');
                ctx.drawImage(img, 0, 0);
                const now = new Date();

                if (now.getHours() >= 20 || now.getHours() < 4) {
                    time = 2;
                } else if (now.getHours() >= 4 && now.getHours() < 10) {
                    time = 0;
                } else {
                    time = 1;
                };

                ctx.drawImage(img, 578 * time, 0, 578, 398, 0, 0, 578, 398);
                const layout = visitors[Math.floor(Math.random() * visitors.length)];
                guests = await bank.currency.getRandomShinx(layout.length, shinx.user_id, interaction.guild);
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

                if (shinx.sleep < 0.2 || shinx.hunger < 0.2) {
                    reaction = playing[0];
                } else {
                    reaction = playing[Math.floor(Math.random() * (playing.length - 1)) + 1];
                };

                img = await Canvas.loadImage('./assets/reactions.png');
                ctx.drawImage(img, 10 + 30 * reaction[1], 8, 30, 32, 120, 212, 30, 32);
                shinx.play(reaction[2]);

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, content: `**${shinx.nick}** ${reaction[0]}`, files: messageFile });
                break;
            case "park":
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
                let conversation = await bank.currency.getRandomReaction();
                ctx.drawImage(img, 64 * conversation.reaction, 64 * shinx.shiny, 64, 64, 173, 68, 64, 64);

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, content: `**${shinx.nick}** ${conversation.quote}`, files: messageFile });
                break;
            case "release":
                let confirm = false
                let confirmArg = args.find(element => element.name == "confirm");
                if (confirmArg) confirm = confirmArg.value;
                if (!confirm) return sendMessage({ client: client, interaction: interaction, content: `This action is irreversible and will reset all your Shinx's values.\nPlease set the \`confirm\` option for this command to \`true\` if you're sure.` });
                await shinx.destroy();

                return sendMessage({ client: client, interaction: interaction, content: `Successfully released Shinx and reset all it's values.` });
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
        name: "gender",
        type: "SUB_COMMAND",
        description: "Toggle your trainer's gender."
    }, {
        name: "data",
        type: "SUB_COMMAND",
        description: "Show Shinx summary."
    }, {
        name: "tap",
        type: "SUB_COMMAND",
        description: "Tap Shinx!"
    }, {
        name: "nickname",
        type: "SUB_COMMAND",
        description: "Change Shinx's nickname.",
        options: [{
            name: "name",
            type: "STRING",
            description: "What should Shinx's name be?",
            required: true
        }]
    }, {
        name: "equip",
        type: "SUB_COMMAND",
        description: "Equip an item to Shinx.",
        options: [{
            name: "item",
            type: "STRING",
            description: "Item to equip.",
            required: true
        }]
    }, {
        name: "feed",
        type: "SUB_COMMAND",
        description: "Feed Shinx.",
        options: [{
            name: "food",
            type: "STRING",
            description: "Item to feed.",
            required: true
        }]
    }, {
        name: "play",
        type: "SUB_COMMAND",
        description: "Play with Shinx."
    }, {
        name: "park",
        type: "SUB_COMMAND",
        description: "Go to the park."
    }, {
        name: "release",
        type: "SUB_COMMAND",
        description: "Release Shinx.",
        options: [{
            name: "confirm",
            type: "BOOLEAN",
            description: "Are you sure? You can never get this Shinx back."
        }]
    }]
};