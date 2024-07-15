import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import sendMessage from "../sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import questsJSON from "../../submodules/monster-hunter-DB/quests.json" with { type: "json" };

export default async ({ client, interaction, gameName, page }) => {
    // Add quests matching game title to an array
    let questsTotal = questsJSON.quests.filter(quest => quest.game.toLowerCase() == gameName.toLowerCase());
    if (questsTotal.length == 0) return sendMessage({ interaction: interaction, content: "Could not find any quests for that game. If you are certain this game exists the quest list may still be a work in progress." });
    // Sort by difficulty
    questsTotal = questsTotal.sort(compare);
    let mhEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(`${gameName} Quests`);
    let questsButtons = new ActionRowBuilder();
    let questsEmbedFields = [];
    let pageLength = 25;
    let startIndex = pageLength * page - pageLength + 1; // 1, 26, 53, etc.
    let endIndex = startIndex + pageLength - 1; // 25, 50, 75, etc.
    let totalPages = Math.ceil(questsTotal.length / pageLength);

    for (let i = startIndex; i <= endIndex; i++) {
        if (!questsTotal[i]) break;
        let questTitle = `${questsTotal[i].name}\n${questsTotal[i].difficulty}⭐`;
        if (questsTotal[i].isKey) questTitle += ` 🔑`;
        mhEmbed.addFields([{ name: `${questTitle}`, value: `${questsTotal[i].objective} in ${questsTotal[i].map}`, inline: false }]);
    };
    let mhQuestsButtonAppend = `${gameName}|${page}|${totalPages}`;
    //// Checks are deprecated, felt more intuitive without them for this command.
    // if (page > 2)
    const questsFirstButton = new ButtonBuilder()
        .setCustomId(`mhquests|first|${mhQuestsButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('◀️')
    // if (page > 1)
    const questsLeftButton = new ButtonBuilder()
        .setCustomId(`mhquests|left|${mhQuestsButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⬅️')
    // if (questsTotal[endIndex + 1])
    const questsRightButton = new ButtonBuilder()
        .setCustomId(`mhquests|right|${mhQuestsButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('➡️')
    // if (page < totalPages - 1)
    const questsLastButton = new ButtonBuilder()
        .setCustomId(`mhquests|last|${mhQuestsButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('▶️')
    questsButtons.addComponents([questsFirstButton, questsLeftButton, questsRightButton, questsLastButton]);

    mhEmbed.setFooter({ text: `Page ${page}/${totalPages}` });
    let messageObject = { embeds: [mhEmbed], components: questsButtons };
    return messageObject;

};

// Function to sort by difficulty
function compare(a, b) {
    if (a.difficulty > b.difficulty) return -1;
    if (a.difficulty < b.difficulty) return 1;
    return 0;
};