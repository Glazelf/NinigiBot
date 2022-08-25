
// const { Users } = require('../../database/dbServices/server.api');
// const ShinxBattle = require('../../shinx/shinxBattle');
// const colors = ['green', 'yellow', 'orange', 'red', 'purple'];

const colors = ['green', 'yellow', 'orange', 'red', 'purple'];
const ShinxBattle = require('../../virtual_sim/shinxBattle');
const shinxApi = require('../../database/dbServices/shinx.api');
const addLine = require('../../util/battle/addLine');
const wait = require('../../util/battle/waitTurn');
const api_history = require('../../database/dbServices/history.api');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Canvas = require('canvas');
        const hp = require('../../util/battle/getHP');
        const Discord = require("discord.js");

        let author = interaction.user;
        let target = interaction.options.getUser("user");

        if (target.bot) return sendMessage({ client: client, interaction: interaction, content: `You can not battle a bot.` });

        const trainers = [author, target];
        if (!trainers[1]) return sendMessage({ client: client, interaction: interaction, content: `Please tag a valid person to battle.` });
        if (trainers[0].id === trainers[1].id) return sendMessage({ client: client, interaction: interaction, content: `You cannot battle yourself!` });
        if (globalVars.battling.yes) return sendMessage({ client: client, interaction: interaction, content: `Theres already a battle going on.` });
        let shinxes = [];

        for (let i = 0; i < 2; i++) {
            const shinx = await shinxApi.getShinx(trainers[i].id);
            shinxes.push(new ShinxBattle(trainers[i], shinx));
        };

        let ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        const avatars = [trainers[0].displayAvatarURL(globalVars.displayAvatarSettings), trainers[1].displayAvatarURL(globalVars.displayAvatarSettings)];
        let canvas = Canvas.createCanvas(240, 71);
        let ctx = canvas.getContext('2d');
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

        let messageFile = new Discord.MessageAttachment(canvas.toBuffer());
        const answer_buttons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ customId: 'yes_battle', style: 'SUCCESS', label: 'Accept' }))
            .addComponents(new Discord.MessageButton({ customId: 'no_battle', style: 'DANGER', label: 'Reject' }))
        const sent_message = await sendMessage({
            client: client,
            interaction: interaction,
            content: `${trainers[0]} wants to battle!\nDo you accept the challenge, ${trainers[1]}`,
            components: answer_buttons,
            files: [messageFile]
        });

        const filter = (interaction) => (interaction.customId === 'yes_battle' || interaction.customId === 'no_battle') && interaction.user.id === trainers[1].id;
        let trainer_answer;
        try {
            trainer_answer = await sent_message.awaitMessageComponent({ filter, time: 25_000 });
        } catch {
            trainer_answer = null;
        };
        if (!trainer_answer) {
            return sendMessage({ client: client, interaction: interaction, content: `Battle cancelled, the challenge timed out.`, components: [] });
        } else if (trainer_answer.customId === 'no_battle') {
            return sendMessage({ client: client, interaction: interaction, content: `Battle cancelled, user rejected the battle.`, components: [] });
        };
        if (globalVars.battling.yes) return sendMessage({ client: client, interaction: interaction, content: `Theres already a battle going on.`, components: [] });
        globalVars.battling.yes = true;
        let text = '';

        await sendMessage({ client: client, interaction: interaction, components: [], content: 'Let the battle begin!', files: [messageFile] });
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
                        await api_history.incrementCombatAmount(trainers[h].id, i == h);
                        const exp = shinxes[h].gainExperience(shinxes[(h + 1) % 2].level, i !== h);
                        text += addLine(`**${nicks[h]}** won ${exp[0]} exp. points!`);
                        if (exp[1] > 0) {
                            text += addLine(`**${nicks[h]}** grew to level **${shinxes[h].level}**!`);
                        };
                    };

                    for (let p = 0; p < 2; p++) await shinxApi.saveBattle(shinxes[p], p === i);
                    globalVars.battling.yes = false;
                    let messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                    return sendMessage({ client: client, interaction: interaction, content: text, files: messageFile });
                } else {
                    if (result === -1) {
                        text += addLine(`**${nicks[i]}** lost his shield by blocking a deathblow!`);
                    };
                };
            };

            let shinxHP0 = await hp(shinxes[0].percent);
            let shinxHP1 = await hp(shinxes[1].percent);
            const hps = [shinxHP0, shinxHP1]
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
            let messageFile = new Discord.MessageAttachment(canvas.toBuffer());
            await sendMessage({ client: client, interaction: interaction, content: text, files: [messageFile] });
            await wait();
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "battle",
    description: "Battle someone's Shinx.",
    options: [{
        name: "user",
        type: "USER",
        description: "Specify user.",
        required: true
    }]
};