import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    hyperlink,
    hideLinkEmbed
} from "discord.js";
import normalizeString from "../string/normalizeString.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import questsJSON from "../../submodules/monster-hunter-DB/quests.json" with { type: "json" };

export default async ({ gameName, page }) => {
    let messageObject = {};
    // Add quests matching game title to an array
    const gameNameLowercase = normalizeString(gameName); // LowerCase once instead of inside filter, might save performance
    let questsTotal = questsJSON.quests.filter(quest => normalizeString(quest.game) == gameNameLowercase);
    if (questsTotal.length == 0) {
        messageObject.content = `Could not find any quests for that game. If you are certain this game exists it might be added to ${hyperlink("the quest list", hideLinkEmbed("https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/quests.json"))} in the future.`;
        return messageObject;
    };
    // Sort by difficulty
    questsTotal = questsTotal.sort(compare);
    let mhEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(`${gameName} Quests`);
    let questsButtons = new ActionRowBuilder();
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
    const questsFirstButton = new ButtonBuilder()
        .setCustomId(`mhquests|first|${mhQuestsButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('◀️');
    if (page < 2) questsFirstButton.setDisabled(true);
    const questsLeftButton = new ButtonBuilder()
        .setCustomId(`mhquests|left|${mhQuestsButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⬅️');
    if (page < 2) questsLeftButton.setDisabled(true);
    const questsRightButton = new ButtonBuilder()
        .setCustomId(`mhquests|right|${mhQuestsButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('➡️');
    if (!questsTotal[endIndex + 1]) questsRightButton.setDisabled(true);
    const questsLastButton = new ButtonBuilder()
        .setCustomId(`mhquests|last|${mhQuestsButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('▶️');
    if (page >= totalPages) questsLastButton.setDisabled(true);
    questsButtons.addComponents([questsFirstButton, questsLeftButton, questsRightButton, questsLastButton]);

    mhEmbed.setFooter({ text: `Page ${page}/${totalPages}` });
    messageObject.embeds = [mhEmbed];
    messageObject.components = questsButtons;
    return messageObject;
};

// Function to sort by difficulty
function compare(a, b) {
    if (a.difficulty > b.difficulty) return -1;
    if (a.difficulty < b.difficulty) return 1;
    return 0;
};