import {
    SlashCommandBuilder,
    EmbedBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    hyperlink,
    inlineCode,
    ChatInputCommandInteraction,
    MessageFlagsBitField,
    ColorResolvable,
    MessageFlagsBitFieldSettable
} from "discord.js";
import axios, { AxiosResponse } from "axios";
import sendMessage from "../../util/discord/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

interface Phonetic {
    text: string;
    audio: string;
};

interface Definition {
    definition: string;
    example?: string;
    synonyms: string[];
    antonyms: string[];
};

interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
};

interface WordData {
    word: string;
    phonetic?: string;
    phonetics: Phonetic[];
    meanings: Meaning[];
    sourceUrls: string[];
};

const api = "https://api.dictionaryapi.dev/api/v2/";

export default async (interaction: ChatInputCommandInteraction, messageFlags: MessageFlagsBitField) => {
    // @ts-ignore
    await interaction.deferReply({ flags: messageFlags as MessageFlagsBitFieldSettable });

    let inputWord = interaction.options.getString("word");
    let inputWordType = interaction.options.getString("wordtype");
    if (!inputWord) return sendMessage({ interaction: interaction, content: "Please enter a word." });

    let dictionaryEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor as [number, number, number] as ColorResolvable);
    let dictionaryEmbedArray: EmbedBuilder[] = [];

    let wordData: WordData;
    try {
        // Sometimes API doesn't respond when a word doesn't exist, sometimes it errors properly. Timeout is to catch both.
        let wordStatus: AxiosResponse<WordData[]> = await Promise.race([
            axios.get<WordData[]>(`${api}entries/en/${inputWord}`),
            new Promise<AxiosResponse<WordData[]>>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        wordData = wordStatus.data[0];
    } catch (e) {
        // console.log(e);
        let errorEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColorError as [number, number, number] as ColorResolvable)
            .setTitle("Error")
            .setDescription(`Word ${inlineCode(inputWord)} not found.`);
        dictionaryEmbedArray.push(errorEmbed);
        return sendMessage({ interaction: interaction, embeds: dictionaryEmbedArray });
    };

    let wordString = wordData.word;
    let definitionCount = 0;
    // .slice(-1)[0] is to get final entry in array in single line
    let sourceURL = wordData.sourceUrls.find((url: String) => url.split("/").slice(-1)[0].toLowerCase() == wordString.toLowerCase());
    if (!sourceURL) sourceURL = wordData.sourceUrls[0];
    for await (const meaning of wordData.meanings) {
        if (inputWordType && inputWordType.toLowerCase() !== meaning.partOfSpeech.toLowerCase()) continue;
        let meaningTypeString = meaning.partOfSpeech.charAt(0).toUpperCase() + meaning.partOfSpeech.slice(1);
        // Top-level synonym and antonym fields seem to always be empty?
        for await (const definition of meaning.definitions) {
            definitionCount++;
            if (dictionaryEmbed.data.fields?.length === 25) break;
            let wordExtrasString = "";
            if (definition.example) wordExtrasString += `Example: ${definition.example}\n`;
            if (definition.synonyms.length > 0) wordExtrasString += `Synonyms: ${definition.synonyms.join(', ')}\n`;
            if (definition.antonyms.length > 0) wordExtrasString += `Antonyms: ${definition.antonyms.join(', ')}\n`;
            if (wordExtrasString.length == 0) wordExtrasString = "No example, synonyms or antonyms.";
            dictionaryEmbed.addFields({ name: `${meaningTypeString}: ${definition.definition}`, value: wordExtrasString, inline: false });
        };
    };
    if (definitionCount > 25) dictionaryEmbed.setFooter({ text: "Some defintiions were hidden due to length.\nSpecify the word type if you can't find what you're looking for." });
    let wordPhoneticString = "";
    if (wordData.phonetics) {
        // Would be cool if this could be attached as a voice notes but this feature is blocked for bots
        let wordPhoneticsArray = wordData.phonetics.filter((phonetic: { text: String }) => phonetic.text && phonetic.text.length > 0);
        let wordPhoneticsArrayAudio = wordPhoneticsArray.filter((phonetic: { audio: String }) => phonetic.audio && phonetic.audio.length > 0); // Prefer entries with audio available
        if (wordPhoneticsArrayAudio.length > 0) {
            wordPhoneticString = hyperlink(wordPhoneticsArrayAudio[0].text, wordPhoneticsArrayAudio[0].audio);
        } else if (wordPhoneticsArray.length > 0) {
            wordPhoneticString = wordPhoneticsArray[0].text;
        };
    } else if (wordData.phonetic) {
        wordPhoneticString = wordData.phonetic;
    };

    dictionaryEmbed
        .setTitle(wordString)
        .setURL(sourceURL);
    if (wordPhoneticString.length > 0) dictionaryEmbed.setDescription(wordPhoneticString);
    return sendMessage({ interaction: interaction, embeds: [dictionaryEmbed] });
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