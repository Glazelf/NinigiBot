import {
    InteractionContextType,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
    SlashCommandUserOption,
    SlashCommandBooleanOption
} from "discord.js";
import Canvas from "canvas";
import sendMessage from "../../util/sendMessage.js";
import ShinxBattle from "../../util/shinx/shinxBattle.js";
import addLine from "../../util/battle/addLine.js";
import wait from "../../util/battle/waitTurn.js";
import hp from "../../util/battle/getHP.js";
import {
    getShinx,
    getRandomShinx,
    feedShinx,
    getShinxAutofeed,
    changeAutoFeed,
    autoFeedShinx1,
    autoFeedShinx2,
    getRandomReaction,
    nameShinx,
    getShinxShininess,
    isTrainerMale,
    // hasEventTrophy,
    switchShininessAndGet,
    saveBattle
} from "../../database/dbServices/shinx.api.js";
import { buyFood } from "../../database/dbServices/user.api.js";
import { incrementCombatAmount } from "../../database/dbServices/history.api.js";
import applyText from "../../util/shinx/applyCanvasText.js";
import getBelly from "../../util/shinx/getBelly.js";
import getRandomEatingReaction from "../../util/shinx/getRandomEatingReaction.js";
import getRandomVisitorPosition from "../../util/shinx/getRandomVisitorPosition.js";
import playing_reaction from "../../util/shinx/getPlayingReaction.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const autoFeedModes = [
    {
        name: "No auto mode",
        value: 0
    }, {
        name: "Feed automatically",
        value: 1
    }, {
        name: "Feed automatically, buy more food if needed.",
        value: 2
    }
];
const colors = [
    'green',
    'yellow',
    'orange',
    'red',
    'purple'
];

export default async (interaction, ephemeral) => {
    // Every subcommand here except maybe "play" should be accessible in DMs honestly but I don't feel like rewriting them significantly for now to actually allow for that
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;

    let shinx, res, time;
    let canvas, ctx, img;
    let returnString = "";
    let messageFile = null;
    let userFinder = await interaction.guild.members.fetch();

    const now = new Date();
    let master = interaction.user;
    // Auto feed
    let auto_feed = await getShinxAutofeed(master.id);
    if (auto_feed > 0) {
        if (auto_feed == 1) {
            await autoFeedShinx1(master.id);
        } else {
            await autoFeedShinx2(master.id);
        };
    };
    switch (interaction.options.getSubcommand()) {
        case "info":
            shinx = await getShinx(master.id);
            const is_user_male = shinx.user_male;

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
                ctx.fillStyle = getBelly(shinx.getBellyProportion());
                ctx.fillRect(467, 308, 245 * belly_prop, 14);
            };
            if (exp_struct.curr_percent > 0) {
                ctx.fillStyle = '#00d4a8'
                ctx.fillRect(467, 413, 245 * exp_struct.curr_percent, 14);
            };
            messageFile = new AttachmentBuilder(canvas.toBuffer());
            return sendMessage({ interaction: interaction, files: messageFile, ephemeral: ephemeral });
        case "feed":
            // let foodArg = interaction.options.getInteger("food");
            res = await feedShinx(master.id);
            switch (res) {
                case 'NoHungry':
                    returnString = `Shinx is not hungry!`;
                    break;
                case 'NoFood':
                    const commands = await interaction.client.application.commands.fetch();
                    let buyFoodCommandName = "buyfood";
                    const buyFoodCommandId = commands.find(c => c.name == buyFoodCommandName)?.id;
                    returnString = "Not enough food.";
                    if (buyFoodCommandId) returnString += `\nTip: you can buy more using </${buyFoodCommandName}:${buyFoodCommandId}>.`;
                    break;
                case 'Ok':
                    let reactionFeed = getRandomEatingReaction();
                    shinx = await getShinx(master.id);
                    returnString = `**${shinx.nickname}** ${reactionFeed[0]}`;
                    canvas = Canvas.createCanvas(393, 299);
                    ctx = canvas.getContext('2d');
                    img = await Canvas.loadImage('./assets/dining.png');
                    ctx.drawImage(img, 0, 0);
                    img = await Canvas.loadImage('./assets/mc.png');
                    let guests = await getRandomShinx(2, shinx.user_id, interaction.guild);
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
                    ctx.drawImage(img, 10 + 30 * reactionFeed[1], 8, 30, 32, 202, 115, 30, 32);

                    if (now.getHours() > 20 || now.getHours() < 6) {
                        img = await Canvas.loadImage('./assets/dinNight.png');
                        ctx.drawImage(img, 199, 0);
                    };
                    messageFile = new AttachmentBuilder(canvas.toBuffer());
                    break;
            };
            return sendMessage({ interaction: interaction, content: returnString, files: messageFile, ephemeral: ephemeral || (res != 'Ok') });
        case "play":
            shinx = await getShinx(master.id);
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
            const layout = getRandomVisitorPosition();
            let guests = await getRandomShinx(layout.length, shinx.user_id, interaction.guild);
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
            let reactionPlay = playing_reaction();
            if (shinx.belly < 0.2) reactionPlay = playing_reaction(0);

            img = await Canvas.loadImage('./assets/reactions.png');
            ctx.drawImage(img, 10 + 30 * reactionPlay[1], 8, 30, 32, 120, 212, 30, 32);
            shinx.addExperienceAndUnfeed(100 * reactionPlay[2], 1);
            messageFile = new AttachmentBuilder(canvas.toBuffer());
            return sendMessage({
                interaction: interaction,
                content: `**${shinx.nickname}** ${reactionPlay[0]}`,
                files: messageFile,
                ephemeral: ephemeral
            });
        case "talk":
            shinx = await getShinx(master.id);
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
            let conversation = await getRandomReaction();
            ctx.drawImage(img, 64 * conversation.reaction, 64 * shinx.shiny, 64, 64, 173, 68, 64, 64);

            messageFile = new AttachmentBuilder(canvas.toBuffer());
            shinx.addExperienceAndUnfeed(50, 1);
            return sendMessage({ interaction: interaction, content: `**${shinx.nickname}** ${conversation.quote}`, files: messageFile, ephemeral: ephemeral });
        case "nickname":
            let new_nick = interaction.options.getString("nickname");
            res = await nameShinx(master.id, new_nick);
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
                    const is_shiny = await getShinxShininess(master.id);
                    canvas = Canvas.createCanvas(471, 355);
                    ctx = canvas.getContext('2d');
                    img = await Canvas.loadImage('./assets/nicks.png');
                    ctx.drawImage(img, 0, 0);
                    img = await Canvas.loadImage('./assets/mc.png');
                    const is_user_male = await isTrainerMale(master.id);
                    ctx.drawImage(img, 51 * !is_user_male, 72 * 0, 51, 72, 270, 200, 51, 72);
                    img = await Canvas.loadImage('./assets/fieldShinx.png');
                    ctx.drawImage(img, 57 * 8, 48 * is_shiny, 57, 48, 324, 223, 57, 48);
                    img = await Canvas.loadImage('./assets/reactions.png');
                    ctx.drawImage(img, 10 + 30 * 4, 8, 30, 32, 335, 192, 30, 32);
                    returnString = `Nickname changed to **${new_nick}**!`;
                    messageFile = new AttachmentBuilder(canvas.toBuffer());
                    break;
            };
            return sendMessage({
                interaction: interaction,
                content: returnString,
                files: messageFile,
                ephemeral: ephemeral || (res != 'Ok')
            });
        case "shiny":
            // This command is currently broken due to missing checks to see if user has Shiny Charm and possibly broken level-up rewards
            res = null;
            // res = await hasEventTrophy(master.id, 'Shiny Charm');
            if (res) {
                const is_shiny = await switchShininessAndGet(master.id);
                returnString = is_shiny ? `Your Shinx is shiny now` : `Your Shinx is no longer shiny`;
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
                messageFile = new AttachmentBuilder(canvas.toBuffer());
            } else {
                returnString = 'Your Shinx needs to be at least level 50 to make it shiny.';
                messageFile = null;
            };
            return sendMessage({ interaction: interaction, content: returnString, files: messageFile, ephemeral: ephemeral || (res != true) });
        case "buyfood":
            ephemeral = true;
            let amountArg = interaction.options.getInteger("amount");
            res = await buyFood(master.id, amountArg);
            returnString = res ? `Added ${amountArg}🍗 to your account!` : `Not enough money!`;
            return sendMessage({ interaction: interaction, content: returnString, ephemeral: ephemeral || res != true });
        case "autofeed":
            ephemeral = true;
            let modeNumber = interaction.options.getInteger("mode");
            res = await changeAutoFeed(master.id, modeNumber);
            let modeString = autoFeedModes[modeNumber].name;
            returnString = res ? `Changed autofeed to: ${modeString}` : `Autofeed already set to: ${modeString}`;
            return sendMessage({ interaction: interaction, content: returnString, ephemeral: ephemeral || res != true });
        case "release":
            let confirm = false
            let confirmArg = interaction.options.getBoolean("confirm");
            if (confirmArg === true) confirm = confirmArg;
            if (!confirm) return sendMessage({ interaction: interaction, content: `This action is irreversible and will reset all your Shinx's values.\nPlease set the \`confirm\` option for this command to \`true\` if you're sure.` });
            shinx = await getShinx(master.id);
            let shinxNickname = shinx.nickname;
            await shinx.destroy();
            return sendMessage({ interaction: interaction, content: `Released your Shinx.\nBye-bye, ${shinxNickname}!` });
        case "battle":
            let target = interaction.options.getUser("user");
            if (target.bot) return sendMessage({ interaction: interaction, content: `You can not battle a bot.` });
            const trainers = [interaction.user, target];
            if (!trainers[1]) return sendMessage({ interaction: interaction, content: `Please tag a valid person to battle.` });
            if (trainers[0].id === trainers[1].id) return sendMessage({ interaction: interaction, content: `You cannot battle yourself!` });
            if (globalVars.battling.yes) return sendMessage({ interaction: interaction, content: `Theres already a battle going on.` });
            let shinxes = [];

            for (let i = 0; i < 2; i++) {
                const shinx = await getShinx(trainers[i].id);
                shinxes.push(new ShinxBattle(trainers[i], shinx));
            };
            ephemeral = false;
            await interaction.deferReply({ ephemeral: ephemeral });

            const avatars = [trainers[0].displayAvatarURL(globalVars.displayAvatarSettings), trainers[1].displayAvatarURL(globalVars.displayAvatarSettings)];
            canvas = Canvas.createCanvas(240, 71);
            ctx = canvas.getContext('2d');
            let background = await Canvas.loadImage('./assets/vs.png');
            ctx.drawImage(background, 0, 0);
            ctx.beginPath();
            for (let i = 0; i < 2; i++) ctx.arc(47 + 147 * i, 36, 29, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.clip();
            for (let i = 0; i < 2; i++) {
                const avatar = await Canvas.loadImage(avatars[i]);
                ctx.drawImage(avatar, 18 + 147 * i, 7, 58, 58);
            };

            messageFile = new AttachmentBuilder(canvas.toBuffer());
            const battleAcceptButton = new ButtonBuilder()
                .setCustomId("battleYes")
                .setStyle(ButtonStyle.Success)
                .setLabel("Accept");
            const battleRefuseButton = new ButtonBuilder()
                .setCustomId("battleNo")
                .setStyle(ButtonStyle.Danger)
                .setLabel("Refuse");
            const answer_buttons = new ActionRowBuilder()
                .addComponents([battleAcceptButton, battleRefuseButton]);
            const sent_message = await sendMessage({ interaction: interaction, content: `${trainers[0]} wants to battle!\nDo you accept the challenge, ${trainers[1]}?`, components: answer_buttons, files: [messageFile] });

            const filter = (interaction) => (interaction.customId === 'battleYes' || interaction.customId === 'battleNo') && interaction.user.id === trainers[1].id;
            let trainer_answer;
            try {
                trainer_answer = await sent_message.awaitMessageComponent({ filter, time: 25_000 });
            } catch {
                trainer_answer = null;
            };
            if (!trainer_answer) {
                return sendMessage({ interaction: interaction, content: `Battle cancelled, the challenge timed out.`, components: [] });
            } else if (trainer_answer.customId === 'battleNo') {
                return sendMessage({ interaction: interaction, content: `Battle cancelled, ${trainers[1]} rejected the challenge.`, components: [] });
            };
            if (globalVars.battling.yes) return sendMessage({ interaction: interaction, content: `Theres already a battle going on.`, components: [] });
            globalVars.battling.yes = true;
            let text = '';

            await sendMessage({ interaction: interaction, components: [], content: 'Let the battle begin!', files: [messageFile] });
            await wait();
            // await interaction.channel.send({ files: [messageFile] });
            canvas = Canvas.createCanvas(240, 168);
            ctx = canvas.getContext('2d');
            background = await Canvas.loadImage('./assets/battleUI.png');
            ctx.drawImage(background, 0, 0);
            ctx.font = 'normal bolder 14px Arial';
            ctx.fillStyle = '#FFFFFF';
            const image_nicks = [];
            for (let i = 0; i < 2; i++) shinxes[i].nick.trim().toLowerCase() === 'shinx' ? image_nicks.push(`${shinxes[i].owner.username}'s Shinx`) : image_nicks.push(shinxes[i].nick);
            for (let i = 0; i < 2; i++) {
                ctx.fillText(image_nicks[i], 53 + 49 * i, 49 + 79 * i);
            };
            const battleSprite = await Canvas.loadImage('./assets/battleSprite.png');

            for (let i = 0; i < 2; i++) {
                if (shinxes[i].shiny) {
                    ctx.drawImage(battleSprite, 39 * i, 0, 39, 26, (12 + 177 * i), 24 + 79 * i, 39, 26);
                };
            };

            const nicks = [];
            const prevColors = [0, 0];
            for (let i = 0; i < 2; i++) nicks.push(`${shinxes[i].owner.username}'s ${shinxes[i].nick}`);
            const geasson = await Canvas.loadImage('./assets/geasson.png');
            const geassoff = await Canvas.loadImage('./assets/geassoff.png');

            for (let i = 0; i < 2; i++) {
                if (shinxes[i].geass > 0) {
                    text += addLine(`**...?**\nThe power of love remains!\n**${nicks[i]} entered geass mode!**`);
                    ctx.drawImage(geasson, 52 + 35 * i, 20 + 79 * i);
                    ctx.font = 'normal bolder 14px Arial';
                    ctx.fillStyle = '#fc03c2';
                    ctx.fillText(trainers[i].username, 53 + 49 * i, 49 + 79 * i);
                };
            };
            if (text.length > 0) interaction.channel.send({ content: text });
            while (true) {
                text = '';
                for (let i = 0; i < 2; i++) {
                    const attackMove = shinxes[i].attack();
                    text += addLine(`**${nicks[i]}** used **${attackMove[0]}**!`);
                    const result = shinxes[(i + 1) % 2].takeDamage(attackMove);
                    if (result === true) {
                        canvas = Canvas.createCanvas(240, 130);
                        ctx = canvas.getContext('2d');
                        background = await Canvas.loadImage('./assets/results.png');
                        ctx.drawImage(background, 0, 0);
                        ctx.beginPath();
                        for (let i = 0; i < 2; i++) ctx.arc(58 + 134 * i, 83, 40, 0, Math.PI * 2, false);
                        ctx.closePath();
                        ctx.clip();
                        for (let q = 0; q < 2; q++) {
                            const avatar = await Canvas.loadImage(avatars[q]);
                            ctx.drawImage(avatar, 18 + 134 * (q === i), 43, 80, 80);
                        };
                        text += addLine(`**${nicks[(i + 1) % 2]}** fainted!`);
                        for (let h = 0; h < 2; h++) {
                            await incrementCombatAmount(trainers[h].id, i == h);
                            const exp = shinxes[h].gainExperience(shinxes[(h + 1) % 2].level, i !== h);
                            text += addLine(`**${nicks[h]}** won ${exp[0]} exp. points!`);
                            if (exp[1] > 0) {
                                text += addLine(`**${nicks[h]}** grew to level **${shinxes[h].level}**!`);
                            };
                        };
                        for (let p = 0; p < 2; p++) await saveBattle(shinxes[p], p === i);
                        globalVars.battling.yes = false;
                        messageFile = new AttachmentBuilder(canvas.toBuffer());
                        return sendMessage({ interaction: interaction, content: text, files: messageFile });
                    } else {
                        if (result === -1) {
                            text += addLine(`**${nicks[i]}** lost his shield by blocking a deathblow!`);
                        };
                    };
                };
                let shinxHP0 = await hp(shinxes[0].percent);
                let shinxHP1 = await hp(shinxes[1].percent);
                const hps = [shinxHP0, shinxHP1];
                for (let i = 0; i < 2; i++) {
                    if (!isNaN(hps[i][0])) {
                        const color = hps[i][0];
                        if (color > 2 && prevColors[i] <= color - 1) {
                            ctx.fillStyle = colors[color - 1];
                            ctx.fillRect(38 + 90 * i, 58 + 78 * i, 96, 4);
                        };
                        ctx.fillStyle = colors[color];
                        ctx.fillRect(38 + 90 * i, 58 + 78 * i, hps[i][1], 4);
                        prevColors[i] = color;
                    };
                    if (shinxes[i].geassMode()) {
                        text += addLine(`**...?**\nThe power of love remains!\n**${nicks[i]} entered Geass mode!**`);
                        ctx.drawImage(geasson, 52 + 35 * i * i, 20 + 79 * i);
                        ctx.font = 'normal bolder 14px Arial';
                        ctx.fillStyle = '#fc03c2';
                        ctx.fillText(image_nicks[i], 53 + 49 * i, 49 + 79 * i);
                    };
                    if (shinxes[i].reduceGeass()) {
                        text += addLine(`**${nicks[i]} no longer has Geass mode!**`);
                        ctx.drawImage(geassoff, 52 + 35 * i * i, 20 + 79 * i);
                        ctx.font = 'normal bolder 14px Arial';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(image_nicks[i], 53 + 49 * i, 49 + 79 * i);
                    };
                };
                messageFile = new AttachmentBuilder(canvas.toBuffer());
                await sendMessage({ interaction: interaction, content: text, files: [messageFile] });
                await wait();
            };
    };
};

// Level and Shiny subcommands are missing on purpose
// String options
const nicknameOption = new SlashCommandStringOption()
    .setName("nickname")
    .setDescription("New Shinx nickname.")
    .setMinLength(1)
    .setMaxLength(12)
    .setRequired(true);
// Integer options
const amountOption = new SlashCommandIntegerOption()
    .setName("amount")
    .setDescription("Amount of food to buy.")
    .setMinValue(1)
    .setRequired(true);
const modeOption = new SlashCommandIntegerOption()
    .setName("mode")
    .setDescription("Mode you want to set.")
    .setChoices(autoFeedModes)
    .setRequired(true);
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("Specify user to battle.")
    .setRequired(true);
// Boolean options
const confirmOption = new SlashCommandBooleanOption()
    .setName("confirm")
    .setDescription("Are you sure? You can never get this Shinx back.");
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const infoSubcommand = new SlashCommandSubcommandBuilder()
    .setName("info")
    .setDescription("See info on your Shinx.")
    .addBooleanOption(ephemeralOption);
const feedSubcommand = new SlashCommandSubcommandBuilder()
    .setName("feed")
    .setDescription("Feed your Shinx.");
const playSubcommand = new SlashCommandSubcommandBuilder()
    .setName("play")
    .setDescription("Play with your Shinx.")
    .addBooleanOption(ephemeralOption);
const talkSubcommand = new SlashCommandSubcommandBuilder()
    .setName("talk")
    .setDescription("Talk to your Shinx.")
    .addBooleanOption(ephemeralOption);
const nicknameSubcommand = new SlashCommandSubcommandBuilder()
    .setName("nickname")
    .setDescription("Change your Shinx's nickname.")
    .addStringOption(nicknameOption);
const shinySubcommand = new SlashCommandSubcommandBuilder()
    .setName("shiny")
    .setDescription("Toggle your Shinx being shiny.");
const releaseSubcommand = new SlashCommandSubcommandBuilder()
    .setName("release")
    .setDescription("Release your Shinx.")
    .addBooleanOption(confirmOption);
const buyfoodSubcommand = new SlashCommandSubcommandBuilder()
    .setName("buyfood")
    .setDescription("Buy food for your Shinx.")
    .addIntegerOption(amountOption);
const autofeedSubcommand = new SlashCommandSubcommandBuilder()
    .setName("autofeed")
    .setDescription("Automate the feeding process of Shinx.")
    .addIntegerOption(modeOption);
const battleSubcommand = new SlashCommandSubcommandBuilder()
    .setName("battle")
    .setDescription("Battle someone's Shinx.")
    .addUserOption(userOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("shinx")
    .setDescription("Interact with your Shinx")
    .setContexts([InteractionContextType.Guild])
    .addSubcommand(infoSubcommand)
    .addSubcommand(feedSubcommand)
    .addSubcommand(playSubcommand)
    .addSubcommand(talkSubcommand)
    .addSubcommand(nicknameSubcommand)
    // .addSubcommand(shinySubcommand) // Disabled untill https://github.com/Glazelf/NinigiBot/issues/838 is fixed
    .addSubcommand(buyfoodSubcommand)
    .addSubcommand(autofeedSubcommand)
    .addSubcommand(battleSubcommand)
    .addSubcommand(releaseSubcommand);