const Discord = require("discord.js");
exports.run = async (client, interaction, logger) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');

        if (!interaction.guild.features.includes("COMMUNITY") || !interaction.guild.publicUpdatesChannel) return sendMessage({ client: client, interaction: interaction, content: "This server has Community features disabled.\nThese are required for this command to work properly.\nMod mail will be sent to the same channel as community updates." });

        const modal = new Discord.ModalBuilder()
            .setCustomId('modMailModal')
            .setTitle('Mod Mail 📧');
        const titleInput = new Discord.TextInputBuilder()
            .setCustomId('modMailTitle')
            .setLabel("Title your mail!")
            .setPlaceholder("Someone is harassing me.")
            .setStyle(Discord.TextInputStyle.Short)
            .setMinLength(5)
            .setMaxLength(256)
            .setRequired(true);
        const descriptionInput = new Discord.TextInputBuilder()
            .setCustomId('modMailDescription')
            .setLabel("Elaborate on your problem.")
            .setPlaceholder("User BigYoshi28 (748199267725869127) is calling me a stinky nerd!")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setMinLength(10)
            .setMaxLength(1024)
            .setRequired(true);
        const actionRow1 = new Discord.ActionRowBuilder().addComponents(titleInput);
        const actionRow2 = new Discord.ActionRowBuilder().addComponents(descriptionInput);

        modal.addComponents(actionRow1, actionRow2);
        return interaction.showModal(modal);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "modmail",
    description: "Send a message to the mods."
};