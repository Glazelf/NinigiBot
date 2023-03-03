exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const axios = require("axios");
        const { uniqueNamesGenerator, names } = require('unique-names-generator'); // Random name generator that can be seeded

        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let catAPI = "https://aws.random.cat/meow";
        let response = await axios.get(catAPI);
        let catImage = response.data.file;

        let catName = uniqueNamesGenerator({
            dictionaries: [names],
            seed: catImage // Seed the random name generator with the cat image URL to get the same name every time
        });

        const catEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setImage(catImage)
            .setFooter({ text: `"Meow" -${catName}` });
        return sendMessage({ client: client, interaction: interaction, embeds: catEmbed, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "randomcat",
    description: "Get a random cat image.",
    options: [{
        name: "ephemeral",
        type: "BOOLEAN",
        description: "Whether the reply will be private."
    }]
};