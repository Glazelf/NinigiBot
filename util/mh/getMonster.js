import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import getWikiURL from "../getWikiURL.js";
import urlExists from "../urlExists.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import monstersJSON from "../../submodules/monster-hunter-DB/monsters.json" with { type: "json" };

const iconsRepo = "https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/";
const mhWiki = "https://static.wikia.nocookie.net/monsterhunter/images/";
// Game names
const mainlineGameNames = { // 3U and 4U are ommitted since they do not have image banner repositories
    MHRise: "Monster Hunter Rise",
    MHW: "Monster Hunter World",
    MHGU: "Monster Hunter Generations Ultimate"
};
const spinoffGameNames = {
    MHST: "Monster Hunter Stories",
    MHST2: "Monster Hunter Stories 2"
};

export default async (monsterData, emojis) => {
    // Get icon, description and game appearances
    let gameDBName, monsterIcon, monsterDescription, monsterDanger;
    let monsterBanner = null;
    let gameAppearances = "";
    let mostRecentMainlineGame = mainlineGameNames.MHRise;
    let fallbackGame1 = mainlineGameNames.MHW;
    let fallbackGame2 = mainlineGameNames.MHGU;
    let mainlineGamesMatches = monsterData.games.filter(game => !Object.values(spinoffGameNames).includes(game.game));
    let mostRecentMainlineGameEntry = mainlineGamesMatches[mainlineGamesMatches.length - 1];

    monsterData.games.forEach(game => {
        // Add to game appearances list
        gameAppearances += game.game;
        if (game.danger) gameAppearances += ` (${game.danger}⭐)`;
        gameAppearances += "\n";
        // Works because games are in chronological order
        if (game.game == mostRecentMainlineGame || game.game == fallbackGame1 || game.game == fallbackGame2) {
            monsterIcon = `${iconsRepo}${game.image}?raw=true`;
            monsterDescription = game.info;
        };
    });
    // If it isn't in the most recent mainline game; instead use the most recent game it's been in
    if (mainlineGamesMatches.length > 0) {
        if (!monsterIcon) monsterIcon = `${iconsRepo}${mostRecentMainlineGameEntry.image}?raw=true`; // OLTURA CRASHES HERE
        if (!monsterDescription) monsterDescription = mostRecentMainlineGameEntry.info;
        if (!monsterDanger) monsterDanger = mostRecentMainlineGameEntry.danger;
    };
    // Get MHRise-Database image
    let isInImageDBGame = gameAppearances.includes(mainlineGameNames.MHRise) || gameAppearances.includes(mainlineGameNames.MHW) || gameAppearances.includes(mainlineGameNames.MHGU);
    let isOnlyInGU = !gameAppearances.includes(mainlineGameNames.MHRise) && !gameAppearances.includes(mainlineGameNames.MHW) && gameAppearances.includes(mainlineGameNames.MHGU);
    let newestGameIsWorld = !gameAppearances.includes(mainlineGameNames.MHRise) && gameAppearances.includes(mainlineGameNames.MHW);
    if (isInImageDBGame) {
        gameDBName = "MHRise";
        let gameDBBranchName = "main";
        let monsterSize = "monster";
        if (!monsterData.isLarge && !isOnlyInGU) monsterSize = "small_monster";
        let monsterURLName = monsterData.name;
        if (!isOnlyInGU) monsterURLName = monsterURLName.replace(/ /g, "_");
        if (monsterURLName == "Narwa_the_Allmother") monsterURLName = "Narwa_The_Allmother"; // wack as fuck
        if (isOnlyInGU) {
            gameDBName = "MHGU";
            gameDBBranchName = "master";
        };
        if (newestGameIsWorld) {
            gameDBName = "MHW";
            gameDBBranchName = "gh-pages";
            monsterURLName = `${monsterURLName}_HZV`;
        };
        if (gameAppearances.includes(mainlineGameNames.MHRise)) monsterURLName = `${monsterURLName}_HZV`;
        monsterBanner = `https://github.com/RoboMechE/${gameDBName}-Database/blob/${gameDBBranchName}/${monsterSize}/${encodeURIComponent(monsterURLName)}.png?raw=true`;
    };
    let monsterGameIndicator = gameDBName;
    if (monsterIcon) monsterGameIndicator = monsterIcon.replace(iconsRepo, "").split("-")[0];
    let monsterRenderName = `${monsterGameIndicator}-${monsterData.name.replace(/ /g, "_")}_Render_001.png`;
    let monsterRender = getWikiURL(monsterRenderName, mhWiki);
    let renderExists = urlExists(monsterRender);
    if (!renderExists) {
        if (["MHGU", "MH4U"].includes(monsterGameIndicator)) {
            // Check for 4U only renders
            for (let i = 5; i > 2; i--) {
                if (renderExists) continue;
                if (i == 5) { // 4U only renders
                    monsterRenderName = monsterRenderName.replace("MHGU", "MH4U");
                } else {
                    monsterRender = getWikiURL(monsterRenderName, mhWiki);
                    renderExists = urlExists(monsterRender);
                    if (renderExists) continue;
                    monsterRenderName = monsterRenderName.replace(`MH${i}U`, `MH${i}`);
                };
                monsterRender = getWikiURL(monsterRenderName, mhWiki);
                renderExists = urlExists(monsterRender);
            };
        } else if (mainlineGamesMatches.length == 0) {
            // Check if there's a render 2 (seems to be for spinoff exclusive monsters, namely Oltura)
            monsterRenderName = monsterRenderName.replace("Render_001", "Render_002").replace(monsterGameIndicator, "MHST2");
            monsterRender = getWikiURL(monsterRenderName, mhWiki);
        };
    };
    if (!monsterBanner) {
        monsterBanner = monsterRender;
        monsterRender = null;
    };
    // Format footer
    let monsterType = monsterData.type;
    if (!monsterData.isLarge) monsterType = `Small ${monsterType}`;
    // Get elements, ailments and weaknesses
    let monsterElements = "";
    let monsterWeaknesses = "";
    let monsterAilments = "";
    if (monsterData.elements) monsterElements = getStringFromObject(monsterData.elements, emojis, "Element");
    if (monsterData.weakness) monsterWeaknesses = getStringFromObject(monsterData.weakness, emojis, "Element");
    if (monsterData.ailments) monsterAilments = getStringFromObject(monsterData.ailments, emojis, "Ailment");

    let buttonArray = [];
    let subSpeciesButtons = new ActionRowBuilder();
    // Get subspecies
    if (monsterData.subSpecies && monsterData.subSpecies.length > 0) {
        if (monsterData.subSpecies.length < 6) {
            for (let i = 0; i < monsterData.subSpecies.length; i++) {
                const subSpeciesButton = new ButtonBuilder()
                    .setCustomId(`mhSub${i}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(monsterData.subSpecies[i]);
                subSpeciesButtons.addComponents(subSpeciesButton);
            };
        } else {
            // How many subspecies do you need??
        };
    };
    // Get base monster
    if (!monsterData.subSpecies) {
        monstersJSON.monsters.forEach(monster => {
            if (!monster.subSpecies) return;
            if (monster.subSpecies.includes(monsterData.name)) {
                const baseMonsterButton = new ButtonBuilder()
                    .setCustomId("mhSubOrigin")
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(monster.name);
                subSpeciesButtons.addComponents(baseMonsterButton);
            };
        });
    };
    if (subSpeciesButtons.components.length > 0) buttonArray.push(subSpeciesButtons);

    let mhEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setAuthor({ name: `${monsterData.name} (${monsterType})`, iconURL: monsterIcon })
        .setThumbnail(monsterRender)
        .setImage(monsterBanner);
    if (monsterDescription) mhEmbed.setDescription(monsterDescription);
    if (monsterElements.length > 0) mhEmbed.addFields([{ name: "Element:", value: monsterElements, inline: true }]);
    if (monsterWeaknesses.length > 0) mhEmbed.addFields([{ name: "Weakness:", value: monsterWeaknesses, inline: true }]);
    if (monsterAilments.length > 0) mhEmbed.addFields([{ name: "Ailment:", value: monsterAilments, inline: true }]);
    mhEmbed.addFields([{ name: "Games:", value: gameAppearances, inline: false }]);

    // Second embed lets you add two images to the same embed by setting the same URL but different images
    // let secondImageEmbed = new EmbedBuilder()
    //     .setURL("https://discord.com/")
    //     .setImage(monsterRender);
    // mhEmbed.setURL("https://discord.com/") // Not clickable since embed has no title, used to display two big images)

    let messageObject = { embeds: [mhEmbed], components: buttonArray };
    return messageObject;
};

// Type is "Ailment" or "Element"
function getStringFromObject(object, emojis, type) {
    let itemArray = [];
    object.forEach(item => {
        let emojiType = type;
        let emojiName = item;
        // Use matching elemental emojis for blights
        if (item.endsWith("blight") && type == "Ailment") {
            emojiType = "Element";
            emojiName = item.replace("blight", "");
        };
        let itemEmoji = emojis.find(emoji => emoji.name == `MH${emojiType}${emojiName}`);
        if (itemEmoji) {
            let itemString = `${itemEmoji}${item}`;
            itemArray.push(itemString);
        } else {
            itemArray.push(item);
        };
    });
    return itemArray.join("\n");
};