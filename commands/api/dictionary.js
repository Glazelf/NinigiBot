import {
    SlashCommandBuilder,
    EmbedBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    hyperlink,
    inlineCode
} from "discord.js";
import axios from "axios";
import sendMessage from "../../util/discord/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const api = "https://api.dictionaryapi.dev/api/v2/";

export default async (interaction, messageFlags) => {
    await interaction.deferReply({ flags: messageFlags });

    //// https://github.com/discordjs/discord.js/issues/10563
    // interaction.client.rest.on("restDebug", console.log);
    // let problemChannel = await interaction.client.rest.get("/channels/581776008978497537");
    // console.log(problemChannel);
    
    let inputWord = interaction.options.getString("word");
    let inputWordType = interaction.options.getString("wordtype");
    let wordStatus;

    let dictionaryEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    try {
        // Sometimes API doesn't respond when a word doesn't exist, sometimes it errors properly. Timeout is to catch both.
        wordStatus = await Promise.race([
            axios.get(`${api}entries/en/${inputWord}`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        wordStatus = wordStatus.data[0];
    } catch (e) {
        // console.log(e);
        let errorEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColorError)
            .setTitle("Error")
            .setDescription(`Word ${inlineCode(inputWord)} not found.`);
        return sendMessage({ interaction: interaction, embeds: errorEmbed });
    };

    let wordString = wordStatus.word;
    // .slice(-1)[0] is to get final entry in array in single line
    let sourceURL = wordStatus.sourceUrls.find((url) => url.split("/").slice(-1)[0].toLowerCase() == wordString.toLowerCase());
    if (!sourceURL) sourceURL = wordStatus.sourceUrls[0];
    for await (const meaning of wordStatus.meanings) {
        if (inputWordType && inputWordType.toLowerCase() !== meaning.partOfSpeech.toLowerCase()) continue;
        let meaningTypeString = meaning.partOfSpeech.charAt(0).toUpperCase() + meaning.partOfSpeech.slice(1);
        // Top-level synonym and antonym fields seem to always be empty?
        for await (const definition of meaning.definitions) {
            let wordExtrasString = "";
            if (definition.example) wordExtrasString += `Example: ${definition.example}\n`;
            if (definition.synonyms.length > 0) wordExtrasString += `Synonyms: ${definition.synonyms.join(', ')}\n`;
            if (definition.antonyms.length > 0) wordExtrasString += `Antonyms: ${definition.antonyms.join(', ')}\n`;
            if (wordExtrasString.length == 0) wordExtrasString = "No example, synonyms or antonyms.";
            dictionaryEmbed.addFields({ name: `${meaningTypeString}: ${definition.definition}`, value: wordExtrasString, inline: false });
        };
    };
    let wordPhoneticString = "";
    if (wordStatus.phonetics) {
        // Would be cool if this could be attached as a voice notes but this feature is blocked for bots
        let wordPhoneticsArray = wordStatus.phonetics.filter(phonetic => phonetic.text && phonetic.text.length > 0);
        let wordPhoneticsArrayAudio = wordPhoneticsArray.filter(phonetic => phonetic.audio && phonetic.audio.length > 0); // Prefer entries with audio available
        if (wordPhoneticsArrayAudio.length > 0) {
            wordPhoneticString = hyperlink(wordPhoneticsArrayAudio[0].text, wordPhoneticsArrayAudio[0].audio);
        } else if (wordPhoneticsArray.length > 0) {
            wordPhoneticString = wordPhoneticsArray[0].text;
        };
    } else if (wordStatus.phonetic) {
        wordPhoneticString = wordStatus.phonetic;
    };

    dictionaryEmbed
        .setTitle(wordString)
        .setURL(sourceURL);
    if (wordPhoneticString.length > 0) dictionaryEmbed.setDescription(wordPhoneticString);
    return sendMessage({ interaction: interaction, embeds: dictionaryEmbed });
};

const wordTypeChoices = [
    { name: "Noun", value: "noun" },
    { name: "Verb", value: "verb" },
    { name: "Adjective", value: "adjective" }
];

// String options
const wordOption = new SlashCommandStringOption()
    .setName("word")
    .setDescription("Specify word to look up.")
    .setRequired(true);
const wordTypeOption = new SlashCommandStringOption()
    .setName("wordtype")
    .setDescription("Select type of word.")
    .addChoices(wordTypeChoices);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("dictionary")
    .setDescription("Get definition of a word.")
    .addStringOption(wordOption)
    .addStringOption(wordTypeOption)
    .addBooleanOption(ephemeralOption);