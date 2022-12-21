exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        let prompt = interaction.options.getString("prompt");
        let showVoters = interaction.options.getBoolean("showvoters");
        let allowMultiple = interaction.options.getBoolean("allowmultiple");
        let option1 = interaction.options.getString("option1");
        let option2 = interaction.options.getString("option2");
        let option3 = interaction.options.getString("option3");
        let option4 = interaction.options.getString("option4");
        let option5 = interaction.options.getString("option5");

        let progressbarFilled = "█";
        let progressbarEmpty = " ";

        const pollEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setThumbnail(avatar)
            .setAuthor({ name: `Poll` })
            .setDescription(prompt)
            .addField(`1️⃣: ${option1}`, "0%", false)
            .addField(`2️⃣: ${option2}`, "0%", false);
        if (option3) pollEmbed.addField(`3️⃣: ${option3}`, "0%", false);
        if (option4) pollEmbed.addField(`4️⃣: ${option4}`, "0%", false);
        if (option5) pollEmbed.addField(`5️⃣: ${option5}`, "0%", false);
        return sendMessage({ client: client, interaction: interaction, embeds: pollEmbed });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "poll",
    description: "Set up a poll.",
    options: [
        {
            name: "prompt",
            type: "STRING",
            description: "The poll topic.",
            required: true
        }, {
            name: "showvoters",
            type: "BOOLEAN",
            description: "Show who voted for what.",
            required: true
        }, {
            name: "allowmultiple",
            type: "BOOLEAN",
            description: "Allow voting for multiple options.",
            required: true
        }, {
            name: "option1",
            type: "STRING",
            description: "Voting option 1.",
            required: true
        }, {
            name: "option2",
            type: "STRING",
            description: "Voting option 2.",
            required: true
        }, {
            name: "option3",
            type: "STRING",
            description: "Voting option 3.",
            required: false
        }, {
            name: "option4",
            type: "STRING",
            description: "Voting option 4.",
            required: false
        }, {
            name: "option5",
            type: "STRING",
            description: "Voting option 5.",
            required: false
        }]
};
