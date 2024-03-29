const Discord = require("discord.js");
exports.run = async (client, interaction, logger, globalVars, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const axios = require("axios");
        const { uniqueNamesGenerator, names } = require('unique-names-generator'); // Random name generator that can be seeded

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;

        let catText = interaction.options.getString("text");
        let standardCatText = "Meow";
        if (!catText) catText = standardCatText;
        let catAPIInput = interaction.options.getString("api");

        let randomCat = "https://aws.random.cat/meow";
        let catAAS = "https://cataas.com/cat";
        let catAPI = null;
        switch (catAPIInput) {
            case "randomcat":
                catAPI = randomCat;
                break;
            case "catAAS":
                catAPI = catAAS;
                break;
            default:
                // catAAS is a replacement as random.cat has been down for ages!!! Alternate APIs here
                catAPI = catAAS;
        };
        if (catAPI.startsWith(catAAS)) catAPI += "?json=true";
        let response = await axios.get(catAPI);
        let catImage = null;
        let catNameSeed = null;
        if (catAPI.startsWith(randomCat)) {
            catImage = response.data.file;
            catNameSeed = catImage;
        } else if (catAPI.startsWith(catAAS)) {
            catImage = `${catAAS}/${response.data._id}`;
            if (catText !== standardCatText) catImage += `/says/${encodeURIComponent(catText)}`;
            catNameSeed = response.data._id;
        };
        let catName = uniqueNamesGenerator({
            dictionaries: [names],
            seed: catNameSeed
        });
        const catEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setImage(catImage)
            .setFooter({ text: `"${catText}" -${catName}` });
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
        name: "text",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Text to put over the image." // Only works with catAAS
    }, {
        //// random.cat is hidden since the api has been disfunctional for months
        //     name: "api",
        //     type: Discord.ApplicationCommandOptionType.String,
        //     description: "Choose which API you want to use.",
        //     choices: [
        //         { name: "random.cat", value: "randomcat" },
        //         { name: "catAAS", value: "catAAS" }
        //     ]
        // }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};
