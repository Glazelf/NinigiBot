import Discord from "discord.js";
import logger from "../logger.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import monstersJSON from "../../submodules/monster-hunter-DB/monsters.json" with { type: "json" };
import elementEmotes from "../../objects/monsterhunter/elementEmotes.json" with { type: "json" };
import getWikiURL from "../getWikiURL.js";
import imageExists from "../imageExists.js";
import isAdmin from "../isAdmin.js";

export default async (client, interaction, monsterData, ephemeral) => {
    try {
        let adminBot = isAdmin(client, interaction.guild.members.me);
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) && !adminBot) emotesAllowed = false;
        // Game names
        let MHRise = "Monster Hunter Rise";
        let MHW = "Monster Hunter World";
        let MHGU = "Monster Hunter Generations Ultimate";
        let iconsRepo = "https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/";
        let mhWiki = "https://static.wikia.nocookie.net/monsterhunter/images/";
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
            gameAppearances += game.game + "\n";
            // Works because games are in chronological order
            if (game.game == mostRecentMainlineGame || game.game == fallbackGame1 || game.game == fallbackGame2) {
                monsterIcon = `${iconsRepo}${game.image}?raw=true`;
                monsterDescription = game.info;
                monsterDanger = game.danger;
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
            if (!isOnlyInGU) monsterURLName = monsterURLName.replaceAll(" ", "_");
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
        let monsterRenderName = `${monsterGameIndicator}-${monsterData.name.replaceAll(" ", "_")}_Render_001.png`;
        let monsterRender = getWikiURL(monsterRenderName, mhWiki);
        let renderExists = imageExists(monsterRender);
        if (!renderExists) {
            if (monsterGameIndicator == "MHGU" || monsterGameIndicator == "MH4U") {
                // Check for 4U only renders
                if (monsterGameIndicator == "MHGU") {
                    monsterRenderName = monsterRenderName.replace("MHGU", "MH4U");
                    monsterRender = getWikiURL(monsterRenderName, mhWiki);
                    renderExists = imageExists(monsterRender);
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
        // Format size
        let monsterSize = "Small";
        if (monsterData.isLarge) monsterSize = "Large";
        // Get elements, ailments and weaknesses
        let monsterElements = "";
        let monsterWeaknesses = "";
        let monsterAilments = "";
        if (monsterData.elements) {
            monsterData.elements.forEach(element => {
                let elementString = `${element}`;
                if (emotesAllowed) elementString = `${elementEmotes[element]}${element}`;
                if (monsterElements.length == 0) {
                    monsterElements = elementString;
                } else {
                    monsterElements += `, ${elementString}`;
                };
            });
        };
        if (monsterData.weakness) {
            monsterData.weakness.forEach(element => {
                let elementString = `${element}`;
                if (emotesAllowed) elementString = `${elementEmotes[element]}${element}`;
                if (monsterWeaknesses.length == 0) {
                    monsterWeaknesses = elementString;
                } else {
                    monsterWeaknesses += `, ${elementString}`;
                };
            });
        };
        if (monsterData.ailments) {
            monsterData.ailments.forEach(ailment => {
                if (monsterAilments.length == 0) {
                    monsterAilments = ailment;
                } else {
                    monsterAilments += `, ${ailment}`;
                };
            });
        };
        let buttonArray = [];
        let subSpeciesButtons = new Discord.ActionRowBuilder();
        if (monsterData.subSpecies && monsterData.subSpecies.length > 0) {
            if (monsterData.subSpecies.length < 6) {
                for (let i = 0; i < monsterData.subSpecies.length; i++) {
                    subSpeciesButtons.addComponents(new Discord.ButtonBuilder({ customId: `mhSub${i}`, style: Discord.ButtonStyle.Secondary, label: monsterData.subSpecies[i] }));
                };
            } else {
                // How many subspecies do you need??
            };
        };
        if (!monsterData.subSpecies) {
            monstersJSON.monsters.forEach(monster => {
                if (!monster.subSpecies) return;
                if (monster.subSpecies.includes(monsterData.name)) subSpeciesButtons.addComponents(new Discord.ButtonBuilder({ customId: `mhSubOrigin`, style: Discord.ButtonStyle.Secondary, label: monster.name }));
            });
        };
        if (subSpeciesButtons.components.length > 0) buttonArray.push(subSpeciesButtons);

        let mhEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `${monsterData.name} (${monsterData.type})`, iconURL: monsterIcon })
            .setThumbnail(monsterRender);
        if (monsterDescription) mhEmbed.setDescription(monsterDescription);
        if (!monsterData.isLarge) mhEmbed.addFields([{ name: "Size:", value: monsterSize, inline: true }]);
        if (monsterDanger) mhEmbed.addFields([{ name: "Danger:", value: `${monsterDanger}⭐`, inline: true }]);
        if (monsterElements.length > 0) mhEmbed.addFields([{ name: "Element:", value: monsterElements, inline: true }]);
        if (monsterWeaknesses.length > 0) mhEmbed.addFields([{ name: "Weakness:", value: monsterWeaknesses, inline: true }]);
        if (monsterAilments.length > 0) mhEmbed.addFields([{ name: "Ailment:", value: monsterAilments, inline: true }]);
        mhEmbed
            .addFields([{ name: "Games:", value: gameAppearances, inline: false }])
            .setImage(monsterBanner);
        let messageObject = { embeds: mhEmbed, components: buttonArray };
        return messageObject;

    } catch (e) {
        logger(e, client);
    };
};