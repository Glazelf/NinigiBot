import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import axios from "axios";

export default async (client, interaction, ephemeral) => {
    try {
        let api = "https://api.dictionaryapi.dev/api/v2/";

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        await interaction.deferReply({ ephemeral: ephemeral });
        let dictionaryEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor);

        let inputWord = interaction.options.getString("word");
        let inputWordType = interaction.options.getString("wordtype");
        let wordStatus;

        try {
            // Sometimes API doesn't respond when a word doesn't exist, sometimes it errors properly. Timeout is to catch both.
            wordStatus = await Promise.race([
                axios.get(`${api}entries/en/${inputWord}`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            wordStatus = wordStatus.data;
        } catch (e) {
            // console.log(e);
            let errorEmbed = new Discord.EmbedBuilder()
                .setColor('#FF0000')
                .setTitle("Error")
                .setDescription("Word not found.");
            return sendMessage({ client: client, interaction: interaction, embeds: errorEmbed, ephemeral: ephemeral });
        };

        let wordMeaning;
        outerLoop:
        for (let i = 0; i < wordStatus.length; i++) {
            if (inputWordType) {
                for (let meaning of wordStatus[i].meanings) {
                    if (meaning.partOfSpeech.toLowerCase() === inputWordType.toLowerCase()) {
                        wordMeaning = meaning;
                        break outerLoop;
                    };
                };
            };
        };
        if (!wordMeaning) wordMeaning = wordStatus[0].meanings[0];

        let wordPhoneticString = "";
        if (wordStatus[0].phonetics) {
            // Would be cool if this could be attached as a voice notes but this feature is blocked for bots
            let wordPhoneticsArray = wordStatus[0].phonetics.filter(phonetic => phonetic.text && phonetic.text.length > 0);
            let wordPhoneticsArrayAudio = wordPhoneticsArray.filter(phonetic => phonetic.audio && phonetic.audio.length > 0); // Prefer entries with audio available
            if (wordPhoneticsArrayAudio.length > 0) {
                wordPhoneticString = `[${wordPhoneticsArrayAudio[0].text}](<${wordPhoneticsArrayAudio[0].audio}>)`;
            } else if (wordPhoneticsArray.length > 0) {
                wordPhoneticString = wordPhoneticsArray[0].text;
            };
        } else if (wordStatus[0].phonetic) {
            wordPhoneticString = wordStatus[0].phonetic;
        };
        let wordStatusTitle = wordStatus[0].word;
        await wordMeaning.definitions.forEach(definition => {
            let wordDefinition = definition.definition;
            let wordExample = definition.example;
            let wordSynonyms = definition.synonyms;
            let wordAntonyms = definition.antonyms;
            let wordDefinitionString = "";
            if (wordExample) wordDefinitionString += `Example: ${wordExample}\n`;
            if (wordSynonyms.length > 0) wordDefinitionString += `Synonyms: ${wordSynonyms.join(', ')}\n`;
            if (wordAntonyms.length > 0) wordDefinitionString += `Antonyms: ${wordAntonyms.join(', ')}\n`;
            if (wordDefinitionString.length == 0) wordDefinitionString = "No example, synonyms or antonyms found.";
            dictionaryEmbed.addFields([{ name: wordDefinition, value: wordDefinitionString, inline: false }]);
        });
        let wordType = wordMeaning.partOfSpeech;
        let wordSourceUrls = wordStatus[0].sourceUrls;

        dictionaryEmbed
            .setTitle(`${wordStatusTitle}, ${wordType}`)
            .setURL(wordSourceUrls[0]);
        if (wordPhoneticString.length > 0) dictionaryEmbed.setDescription(wordPhoneticString);
        return sendMessage({ client: client, interaction: interaction, embeds: dictionaryEmbed, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "dictionary",
    description: `Get definition of a word.`,
    options: [{
        name: "word",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Specify word to look up.",
        required: true
    }, {
        name: "wordtype",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Select type of word.",
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