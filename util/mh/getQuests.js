module.exports = async ({ client, interaction, gameName, page }) => {
    try {
        const sendMessage = require('../sendMessage');
        const Discord = require("discord.js");
        const questsJSON = require("../../submodules/monster-hunter-DB/quests.json");
        // Add quests matching game title to an array
        let questsTotal = questsJSON.quests.filter(quest => quest.game.toLowerCase() == gameName.toLowerCase());
        if (questsTotal.length == 0) return sendMessage({ client: client, interaction: interaction, content: "Could not find any quests for that game. If you are certain this game exists the quest list may still be a work in progress." });
        // Sort by difficulty
        questsTotal = questsTotal.sort(compare);
        let mhEmbed = new Discord.EmbedBuilder()
            .setColor(client.globalVars.embedColor)
            .setTitle(`${gameName} Quests`);
        let questsButtons = new Discord.ActionRowBuilder();
        let questsEmbedFields = [];
        let totalQuests = questsTotal.length;
        let pageLength = 25;
        let startIndex = pageLength * page - pageLength + 1; // 1, 26, 53, etc.
        let endIndex = startIndex + pageLength - 1; // 25, 50, 75, etc.
        let totalPages = Math.ceil(questsTotal.length / pageLength);

        for (i = startIndex; i <= endIndex; i++) {
            if (!questsTotal[i]) break;
            let questTitle = `${questsTotal[i].name}\n${questsTotal[i].difficulty}⭐`;
            if (questsTotal[i].isKey) questTitle += ` 🔑`;
            mhEmbed.addFields([{ name: `${questTitle}`, value: `${questsTotal[i].objective} in ${questsTotal[i].map}`, inline: false }]);
        };
        let mhQuestsButtonAppend = `${gameName}|${page}|${totalPages}`;
        //// Checks are deprecated, felt more intuitive without them for this command.
        // if (page > 2)
        questsButtons.addComponents(new Discord.ButtonBuilder({ customId: `mhquests|first|${mhQuestsButtonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '◀️' }));
        // if (page > 1)
        questsButtons.addComponents(new Discord.ButtonBuilder({ customId: `mhquests|left|${mhQuestsButtonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '⬅️' }));
        // if (questsTotal[endIndex + 1])
        questsButtons.addComponents(new Discord.ButtonBuilder({ customId: `mhquests|right|${mhQuestsButtonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '➡️' }));
        // if (page < totalPages - 1)
        questsButtons.addComponents(new Discord.ButtonBuilder({ customId: `mhquests|last|${mhQuestsButtonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '▶️' }));

        mhEmbed.setFooter({ text: `Page ${page}/${totalPages}` });
        let messageObject = { embeds: mhEmbed, components: [questsButtons] };
        return messageObject;

        // Function to sort by difficulty
        function compare(a, b) {
            if (a.difficulty > b.difficulty) return -1;
            if (a.difficulty < b.difficulty) return 1;
            return 0;
        };

    } catch (e) {
        // Log error
        const logger = require('../logger');
        logger(e, client);
    };
};