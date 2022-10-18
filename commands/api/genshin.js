exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const axios = require("axios");
        const getWikiURL = require('../../util/getWikiURL');
        const parseDate = require('../../util/parseDate');
        const capitalizeString = require('../../util/capitalizeString');

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let giAPI = `https://api.genshin.dev/`;
        let giWiki = `https://static.wikia.nocookie.net/gensin-impact/images/`;
        let response;
        let buttonArray = [];
        let giEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);

        switch (interaction.options.getSubcommand()) {
            case "character":
                giAPI += `characters/`;
                let characterName = interaction.options.getString("character").toLowerCase();
                let detailed = false;
                let detailedArg = interaction.options.getBoolean("detailed");
                if (detailedArg === true) detailed = true;
                response = await axios.get(giAPI + characterName);
                if (response.status != 200) return sendMessage({ client: client, interaction: interaction, content: `Error occurred, make sure that character exists.` });
                let character = response.data;
                let characterThumbnailFile = `Character_${character.name}_Thumb.png`;
                let characterThumbnail = getWikiURL(characterThumbnailFile, giWiki);
                let characterBannerFile = `Character_${character.name}_Full_Wish.png`;
                let characterBanner = getWikiURL(characterBannerFile, giWiki);
                // We should REALLY change how birthdays are stored LOL
                let characterBirthdayArray = [];
                let characterBirthday = "";
                if (character.birthday) {
                    characterBirthdayArray = character.birthday.split("-");
                    characterBirthday = parseDate(`${characterBirthdayArray[2]}${characterBirthdayArray[1]}`);
                };

                giEmbed
                    .setAuthor({ name: `${character.name} - ${character.affiliation}` })
                    .setThumbnail(characterThumbnail)
                    .setImage(characterBanner)
                    .setDescription(character.description)
                    .addField("Rarity:", `${character.rarity}⭐`, true)
                    .addField("Vision:", character.vision, true)
                    .addField("Weapon:", character.weapon, true);
                if (character.birthday) giEmbed.addField("Birthday:", characterBirthday, true);

                if (detailed) {
                    // All three of these functions can probably be combined better but whatever
                    // Every (most) characters have 3 active and 3 passive skills and 6 constellations, making 12 fields
                    await character.skillTalents.forEach(skill => {
                        let skillDesc = skill.description.replace("\n\n", "\n");
                        if (skillDesc.length <= 1028) {
                            giEmbed.addField(`${skill.name} (Active)`, skillDesc, false);
                        } else {
                            giEmbed.addField(`${skill.name} (Active) Part 1`, `${skillDesc.substring(0, 1021)}...`, false);
                            giEmbed.addField(`${skill.name} (Active) Part 2`, `...${skillDesc.substring(1021,)}`, false);
                        };
                    });
                    await character.passiveTalents.forEach(passive => {
                        giEmbed.addField(`${passive.name} (Passive)`, `${passive.unlock}\n${passive.description.replace("\n\n", "\n")}`, false);

                    });
                    await character.constellations.forEach(constellation => {
                        giEmbed.addField(`${constellation.name} (${constellation.unlock})`, constellation.description.replace("\n\n", "\n"), false);
                    });
                };
                break;
            case "weapon":
                giAPI += `weapons/`;
                let weaponName = interaction.options.getString("weapon").toLowerCase();
                response = await axios.get(giAPI + weaponName);
                let weapon = response.data;

                let weaponThumbnailFile = `Weapon_${weapon.name}.png`;
                let weaponThumbnail = getWikiURL(weaponThumbnailFile, giWiki);
                giEmbed
                    .setAuthor({ name: weapon.name })
                    .setThumbnail(weaponThumbnail)
                    .addField("Type:", `${weapon.rarity}⭐ ${weapon.type}`, true)
                    .addField("Location:", weapon.location, true)
                    .addField("Base Attack:", `${weapon.baseAttack}`, true);
                if (weapon.subStat !== "-") giEmbed.addField("Substat:", weapon.subStat, true);
                if (weapon.passiveName !== "-") giEmbed.addField(`${weapon.passiveName} (Passive)`, weapon.passiveDesc, false);
                break;
            case "artifact":
                giAPI += `artifacts/`;
                let artifactName = interaction.options.getString("artifact").toLowerCase();
                response = await axios.get(giAPI + artifactName);
                let artifact = response.data;

                giEmbed
                    .setAuthor({ name: artifact.name })
                    .addField("Max Rarity:", `${artifact.max_rarity}⭐`, true);
                if (artifact["1-piece_bonus"]) giEmbed.addField("1-Piece Bonus:", artifact["1-piece_bonus"], false);
                if (artifact["2-piece_bonus"]) giEmbed.addField("2-Piece Bonus:", artifact["2-piece_bonus"], false);
                if (artifact["3-piece_bonus"]) giEmbed.addField("3-Piece Bonus:", artifact["3-piece_bonus"], false);
                if (artifact["4-piece_bonus"]) giEmbed.addField("4-Piece Bonus:", artifact["4-piece_bonus"], false);
                if (artifact["5-piece_bonus"]) giEmbed.addField("5-Piece Bonus:", artifact["5-piece_bonus"], false);
                break;
        };

        return sendMessage({ client: client, interaction: interaction, embeds: giEmbed, ephemeral: ephemeral, components: buttonArray });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "genshin",
    description: `Shows Genshin Impact data.`,
    options: [{
        name: "character",
        type: "SUB_COMMAND",
        description: "Get info on a character.",
        options: [{
            name: "character",
            type: "STRING",
            description: "Specify character by name.",
            autocomplete: true,
            required: true
        }, {
            name: "detailed",
            type: "BOOLEAN",
            description: "Show detailed info.",
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "weapon",
        type: "SUB_COMMAND",
        description: "Get info on a weapon.",
        options: [{
            name: "weapon",
            type: "STRING",
            description: "Specify weapon by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "artifact",
        type: "SUB_COMMAND",
        description: "Get info on an artifact.",
        options: [{
            name: "artifact",
            type: "STRING",
            description: "Specify artifact by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};