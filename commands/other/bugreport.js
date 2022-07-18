const Discord = require("discord.js");
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        const modal = new Discord.Modal()
            .setCustomId('bugReportModal')
            .setTitle('Bug Report');

        const titleInput = new Discord.TextInputBuilder()
            .setCustomId('bugReportTitle')
            .setLabel("Title your bug report!")
            .setPlaceholder("I saw a weird bug :(")
            .setStyle('SHORT')
            .setMinLength(5)
            .setMaxLength(256)
            .setRequired(true);
        const descriptionInput = new Discord.TextInputBuilder()
            .setCustomId('bugReportDescribe')
            .setLabel("Describe what went wrong.")
            .setPlaceholder("I saw a spider with 10 legs, I don't think that's normal!")
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(1024)
            .setRequired(true);
        const reproduceInput = new Discord.TextInputBuilder()
            .setCustomId('bugReportReproduce')
            .setLabel("How to reproduce this bug?")
            .setPlaceholder("Go left at the third tree, you should see cobwebs.")
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(1024)
            .setRequired(true);
        const behaviourInput = new Discord.TextInputBuilder()
            .setCustomId('bugReportBehaviour')
            .setLabel("What behaviour did you expect?")
            .setPlaceholder("Spiders should have 8 legs.")
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(1024)
            .setRequired(true);
        const contextInput = new Discord.TextInputBuilder()
            .setCustomId('bugReportContext')
            .setLabel("What platform are you using? Beta?")
            .setPlaceholder("Android (Canary)")
            .setStyle('SHORT')
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(true);

        const actionRow1 = new Discord.ActionRowBuilder().addComponents(titleInput);
        const actionRow2 = new Discord.ActionRowBuilder().addComponents(descriptionInput);
        const actionRow3 = new Discord.ActionRowBuilder().addComponents(reproduceInput);
        const actionRow4 = new Discord.ActionRowBuilder().addComponents(behaviourInput);
        const actionRow5 = new Discord.ActionRowBuilder().addComponents(contextInput);

        modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4, actionRow5);
        return interaction.showModal(modal);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "bugreport",
    description: "Report bugs in the bot."
};