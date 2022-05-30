exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        const modal = new Discord.Modal()
            .setCustomId('bugReportModal')
            .setTitle('Bug Report');

        const titleInput = new Discord.TextInputComponent()
            .setCustomId('bugReportTitle')
            .setLabel("Title your bug report!")
            .setPlaceholder("I saw a weird bug :(")
            .setStyle('SHORT')
            .setMinLength(5)
            .setMaxLength(256)
            .setRequired(true);
        const descriptionInput = new Discord.TextInputComponent()
            .setCustomId('bugReportDescribe')
            .setLabel("Describe what went wrong.")
            .setPlaceholder("I saw a spider with 10 legs, I don't think that's normal!")
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(1024)
            .setRequired(true);
        const reproduceInput = new Discord.TextInputComponent()
            .setCustomId('bugReportReproduce')
            .setLabel("How to reproduce this bug?")
            .setPlaceholder("Go left at the third tree, you should see cobwebs.")
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(1024)
            .setRequired(true);
        const behaviourInput = new Discord.TextInputComponent()
            .setCustomId('bugReportBehaviour')
            .setLabel("What behaviour did you expect?")
            .setPlaceholder("Spiders should have 8 legs.")
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(1024)
            .setRequired(true);
        const contextInput = new Discord.TextInputComponent()
            .setCustomId('bugReportContext')
            .setLabel("What platform are you using? Beta?")
            .setPlaceholder("Android (Canary)")
            .setStyle('SHORT')
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(true);

        const actionRow1 = new Discord.MessageActionRow().addComponents(titleInput);
        const actionRow2 = new Discord.MessageActionRow().addComponents(descriptionInput);
        const actionRow3 = new Discord.MessageActionRow().addComponents(reproduceInput);
        const actionRow4 = new Discord.MessageActionRow().addComponents(behaviourInput);
        const actionRow5 = new Discord.MessageActionRow().addComponents(contextInput);

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