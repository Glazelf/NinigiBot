import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import monstersJSON from "../../submodules/monster-hunter-DB/monsters.json" with { type: "json" };
import elementEmojis from "../../objects/monsterhunter/elementEmojis.json" with { type: "json" };
import ailmentEmojis from "../../objects/monsterhunter/ailmentEmojis.json" with { type: "json" };
import getWikiURL from "../getWikiURL.js";
import urlExists from "../urlExists.js";

let iconsRepo = "https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/";
let mhWiki = "https://static.wikia.nocookie.net/monsterhunter/images/";
// Game names
let MHRise = "Monster Hunter Rise";
let MHW = "Monster Hunter World";
let MHGU = "Monster Hunter Generations Ultimate";

export default async (monsterData) => {
    let gameDBName;
    // Get icon, description and game appearances
    let monsterIcon;
    let monsterBanner = null;
    let monsterDescription;
    let monsterDanger;
    let gameAppearances = "";
    let mostRecentMainlineGame = MHRise;
    let fallbackGame1 = MHW;
    let fallbackGame2 = MHGU;
    let mostRecentGameEntry = monsterData.games[monsterData.games.length - 1];
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
    if (!monsterIcon) monsterIcon = `${iconsRepo}${mostRecentGameEntry.image}?raw=true`;
    if (!monsterDescription) monsterDescription = mostRecentGameEntry.info;
    if (!monsterDanger) monsterDanger = mostRecentGameEntry.danger;
    // Get MHRise-Database image
    let isInImageDBGame = gameAppearances.includes(MHRise) || gameAppearances.includes(MHW) || gameAppearances.includes(MHGU);
    let isOnlyInGU = !gameAppearances.includes(MHRise) && !gameAppearances.includes(MHW) && gameAppearances.includes(MHGU);
    let newestGameIsWorld = !gameAppearances.includes(MHRise) && gameAppearances.includes(MHW);
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
        if (gameAppearances.includes(MHRise)) monsterURLName = `${monsterURLName}_HZV`;
        monsterBanner = `https://github.com/RoboMechE/${gameDBName}-Database/blob/${gameDBBranchName}/${monsterSize}/${encodeURIComponent(monsterURLName)}.png?raw=true`;
    };
    let monsterGameIndicator = gameDBName;
    if (monsterIcon) monsterGameIndicator = monsterIcon.replace(iconsRepo, "").split("-")[0];
    let monsterRenderName = `${monsterGameIndicator}-${monsterData.name.replace(/ /g, "_")}_Render_001.png`;
    let monsterRender = getWikiURL(monsterRenderName, mhWiki);
    let renderExists = urlExists(monsterRender);
    if (!renderExists) {
        if (monsterGameIndicator == "MHGU" || monsterGameIndicator == "MH4U") {
            // Check for 4U only renders
            if (monsterGameIndicator == "MHGU") {
                monsterRenderName = monsterRenderName.replace("MHGU", "MH4U");
                monsterRender = getWikiURL(monsterRenderName, mhWiki);
                renderExists = urlExists(monsterRender);
            };
            if (!renderExists) {
                monsterRenderName = monsterRenderName.replace("MH4U", "MH4");
                monsterRender = getWikiURL(monsterRenderName, mhWiki);
            };
        } else {
            // Check if there's a render 2 (seems to be for spinoff exclusive monsters, namely Oltura)
            monsterRenderName = monsterRenderName.replace("Render_001", "Render_002");
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
    if (monsterData.elements) monsterElements = getStringFromObject(monsterData.elements, elementEmojis);
    if (monsterData.weakness) monsterWeaknesses = getStringFromObject(monsterData.weakness, elementEmojis);
    if (monsterData.ailments) monsterAilments = getStringFromObject(monsterData.ailments, ailmentEmojis);

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
    mhEmbed.addFields([{ name: "Games (Danger):", value: gameAppearances, inline: false }]);

    // Second embed lets you add two images to the same embed by setting the same URL but different images
    // let secondImageEmbed = new EmbedBuilder()
    //     .setURL("https://discord.com/")
    //     .setImage(monsterRender);
    // mhEmbed.setURL("https://discord.com/") // Not clickable since embed has no title, used to display two big images)

    let messageObject = { embeds: [mhEmbed], components: buttonArray };
    return messageObject;
};

function getStringFromObject(object, emojis) {
    let itemArray = [];
    object.forEach(item => {
        let itemEmoji = emojis[item];
        if (itemEmoji) {
            let itemString = `${itemEmoji}${item}`;
            itemArray.push(itemString);
        } else {
            itemArray.push(item);
        };
    });
    return itemArray.join(", ");
};