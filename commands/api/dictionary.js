const Discord = require("discord.js");
exports.run = async (client, interaction, logger, globalVars, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const axios = require("axios");
        let api = "https://api.dictionaryapi.dev/api/v2/";

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        await interaction.deferReply({ ephemeral: ephemeral });
        let dictionaryEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor);

            let inputWord = interaction.options.getString("word");
            wordStatus = await axios.get(`${api}entries/en/${inputWord}`);
            wordStatus = wordStatus.data;
            await wordStatus.forEach(async word => {
                let wordStatusTitle = word.word;
                let wordPhonetic =  word.phonetic
                
            });
            dictionaryEmbed.setTitle(wordStatusTitle);
            dictionaryEmbed.setDescription(wordPhonetic);
    return sendMessage({ client: client, interaction: interaction, embeds: dictionaryEmbed, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "dictionary",
    description: `Checks the dictionary`,
    options: [{
        name: "word",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Specify word to look up.",
        required: true
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};