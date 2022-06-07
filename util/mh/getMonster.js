module.exports = async (client, interaction, monsterData, ephemeral) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");
        const crypto = require('crypto');
        const elementEmotes = require('../../objects/monsterhunter/elementEmotes.json');

        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        // Game names
        let MHRise = "Monster Hunter Rise";
        let MHW = "Monster Hunter World";
        let MHGU = "Monster Hunter Generations Ultimate";
        let iconsRepo = "https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/";
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
        if (isInImageDBGame) {
            let isOnlyInGU = !gameAppearances.includes(MHRise) && !gameAppearances.includes(MHW) && gameAppearances.includes(MHGU);
            let newestGameIsWorld = !gameAppearances.includes(MHRise) && gameAppearances.includes(MHW);
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
        let md5 = crypto.createHash("md5").update(monsterRenderName).digest("hex");
        let md5first = md5.substring(0, 1);
        let md5duo = md5.substring(0, 2);
        let monsterRender = `https://static.wikia.nocookie.net/monsterhunter/images/${md5first}/${md5duo}/${encodeURIComponent(monsterRenderName)}`;
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
        let subSpeciesButtons = new Discord.MessageActionRow();
        if (monsterData.subSpecies && monsterData.subSpecies.length > 0) {
            if (monsterData.subSpecies.length < 6) {
                for (let i = 0; i < monsterData.subSpecies.length; i++) {
                    subSpeciesButtons.addComponents(new Discord.MessageButton({ customId: `mhSub${i}`, style: 'SECONDARY', label: monsterData.subSpecies[i] }));
                };
            } else {
                // How many subspecies do you need??
            };
        };
        if (subSpeciesButtons.components.length > 0) buttonArray.push(subSpeciesButtons);

        let mhEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `${monsterData.name} (${monsterData.type})`, iconURL: monsterIcon })
            .setThumbnail(monsterRender);
        if (monsterDescription) mhEmbed.setDescription(monsterDescription);
        if (!monsterData.isLarge) mhEmbed.addField("Size:", monsterSize, true);
        if (monsterDanger) mhEmbed.addField("Danger:", `${monsterDanger}⭐`, true);
        if (monsterElements.length > 0) mhEmbed.addField("Element:", monsterElements, true);
        if (monsterWeaknesses.length > 0) mhEmbed.addField("Weakness:", monsterWeaknesses, true);
        if (monsterAilments.length > 0) mhEmbed.addField("Ailment:", monsterAilments, true);
        mhEmbed
            .addField("Games:", gameAppearances, false)
            .setImage(monsterBanner);

        let messageObject = { embeds: mhEmbed, components: buttonArray };
        return messageObject;

    } catch (e) {
        // Log error
        const logger = require('../logger');

        logger(e, client);
    };
};