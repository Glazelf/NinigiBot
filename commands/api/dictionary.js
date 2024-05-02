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

        let inputWordType = interaction.options.getString("wordtype");

        let wordMeaning;
        for (let i; i < wordStatus.length; i++) {
        if (inputWordType) {
            for (let meaning of wordStatus[i].meanings) {
                if (meaning.partOfSpeech.toLowerCase() === inputWordType.toLowerCase()) {
                    wordMeaning = meaning;
                    break;
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
        let wordSynonyms = wordMeaning.definitions[0].synonyms;

        dictionaryEmbed.setAuthor({ name: 'DictionaryAPI', url: 'https://dictionaryapi.dev' });
        dictionaryEmbed.setTitle(`${wordStatusTitle} - ${wordPhonetic}`);
        dictionaryEmbed.setURL(`https://www.oxfordlearnersdictionaries.com/definition/english/${wordStatusTitle}_1`);
        dictionaryEmbed.setDescription(`${wordDefinition}`);
        if (wordSynonyms.length > 0) {
            dictionaryEmbed.addFields([{ name: "Synonyms:", value: wordSynonyms.join(', '), inline: false }])
        }

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