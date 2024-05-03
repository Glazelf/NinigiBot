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
        let inputWordType = interaction.options.getString("wordtype");

        try {
            wordStatus = await Promise.race([
                axios.get(`${api}entries/en/${inputWord}`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            wordStatus = wordStatus.data;
        } catch (error) {
            let errorEmbed = new Discord.EmbedBuilder()
                .setColor('#FF0000');
                errorEmbed.setTitle("Error")
                errorEmbed.setDescription("Word not found.");
                return sendMessage({ client: client, interaction: interaction, embeds: errorEmbed, ephemeral: ephemeral });
        }

        let wordMeaning;
        outerLoop:
        for (let i = 0; i < wordStatus.length; i++) {
        if (inputWordType) {
            for (let meaning of wordStatus[i].meanings) {
                if (meaning.partOfSpeech.toLowerCase() === inputWordType.toLowerCase()) {
                    wordMeaning = meaning;
                    break outerLoop;
                }
            }
        }
    }
        if (!wordMeaning) {
            wordMeaning = wordStatus[0].meanings[0];
        }

        let wordStatusTitle = wordStatus[0].word;
        let wordPhonetic = wordStatus[0].phonetic;
        let wordDefinition = wordMeaning.definitions[0].definition;
        let wordExample = wordMeaning.definitions[0].example;
        let wordSynonyms = wordMeaning.definitions[0].synonyms;
        let wordAntonyms = wordMeaning.definitions[0].antonyms;
        let wordType = wordMeaning.partOfSpeech;
        let wordSourceUrls = wordStatus[0].sourceUrls;

        dictionaryEmbed.setAuthor({ name: 'DictionaryAPI', url: 'https://dictionaryapi.dev' });
        dictionaryEmbed.setTitle(`${wordStatusTitle}, ${wordType}`);
        dictionaryEmbed.setURL(`${wordSourceUrls}`);
        dictionaryEmbed.setDescription(`${wordPhonetic}`);
        dictionaryEmbed.addFields([{ name: "Definition:", value: wordDefinition, inline: false }])
        if (wordExample && wordExample.length > 0) {
            dictionaryEmbed.addFields([{ name: "Example:", value: wordExample, inline: false }])
        }
        
        if ((wordSynonyms && wordSynonyms.length > 0) || (wordAntonyms && wordAntonyms.length > 0)) {
            dictionaryEmbed.addFields([{ name: '\n', value: '\n' }])
        }

        if (wordSynonyms && wordSynonyms.length > 0) {
            dictionaryEmbed.addFields([{ name: "Synonyms:", value: wordSynonyms.join(', '), inline: false }])
        }
        
        if (wordAntonyms && wordAntonyms.length > 0) {
            dictionaryEmbed.addFields([{ name: "Antonyms:", value: wordAntonyms.join(', '), inline: false }])
        }
        dictionaryEmbed.setFooter({ text: `Source: ${wordSourceUrls}`});
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
        name: "wordtype",
        type: Discord.ApplicationCommandOptionType.String,
        description: "noun, verb, adjective, etc.",
        choices: [
            { name: "noun", value: "noun" },
            { name: "verb", value: "verb" },
            { name: "adjective", value: "adjective" }
        ]
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};