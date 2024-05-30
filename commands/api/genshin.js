const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const axios = require("axios");
        const getWikiURL = require('../../util/getWikiURL');
        const parseDate = require('../../util/parseDate');

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let giAPI = `https://genshin.jmp.blue/`;
        let giWiki = `https://static.wikia.nocookie.net/gensin-impact/images/`;
        let response;
        let buttonArray = [];
        let giEmbed = new Discord.EmbedBuilder()
            .setColor(client.globalVars.embedColor);
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
                    .setTitle(`${character.name} - ${character.affiliation}`)
                    .setThumbnail(characterThumbnail)
                    .setImage(characterBanner)
                    .addFields([
                        { name: "Rarity:", value: `${character.rarity}⭐`, inline: true },
                        { name: "Vision:", value: character.vision, inline: true },
                        { name: "Weapon:", value: character.weapon, inline: true }
                    ]);
                if (character.description) giEmbed.setDescription(character.description);
                if (character.birthday) giEmbed.addFields([{ name: "Birthday:", value: characterBirthday, inline: true }]);
                if (detailed) {
                    // All three of these functions can probably be combined better but whatever
                    // Every (most) characters have 3 active and 3 passive skills and 6 constellations, making 12 fields
                    await character.skillTalents.forEach(skill => {
                        let skillDesc = skill.description.replace("\n\n", "\n");
                        let descCharacterLimit = 1024;
                        if (skillDesc.length <= descCharacterLimit) {
                            giEmbed.addFields([{ name: `${skill.name} (Active)`, value: skillDesc, inline: false }]);
                        } else {
                            giEmbed.addFields([
                                { name: `${skill.name} (Active)`, value: `${skillDesc.substring(0, descCharacterLimit)}...`, inline: false },
                                { name: `${skill.name} (Active) (cont.)`, value: `...${skillDesc.substring(descCharacterLimit,)}`, inline: false }
                            ]);
                        };
                    });
                    await character.passiveTalents.forEach(passive => {
                        giEmbed.addFields([{ name: `${passive.name} (Passive)`, value: `${passive.unlock}\n${passive.description.replace("\n\n", "\n")}`, inline: false }]);

                    });
                    await character.constellations.forEach(constellation => {
                        giEmbed.addFields([{ name: `${constellation.name} (${constellation.unlock})`, value: constellation.description.replace("\n\n", "\n"), inline: false }]);
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
                    .setTitle(weapon.name)
                    .setThumbnail(weaponThumbnail)
                    .addFields([
                        { name: "Type:", value: `${weapon.rarity}⭐ ${weapon.type}`, inline: true },
                        { name: "Location:", value: weapon.location, inline: true },
                        { name: "Base Attack:", value: weapon.baseAttack.toString(), inline: true },
                    ]);
                if (weapon.subStat !== "-") giEmbed.addFields([{ name: "Substat:", value: weapon.subStat, inline: true }]);
                if (weapon.passiveName !== "-") giEmbed.addFields([{ name: `${weapon.passiveName} (Passive)`, value: weapon.passiveDesc, inline: false }]);
                break;
            case "artifact":
                giAPI += `artifacts/`;
                let artifactName = interaction.options.getString("artifact").toLowerCase();
                response = await axios.get(giAPI + artifactName);
                let artifact = response.data;
                giEmbed
                    .setTitle(artifact.name)
                    .addFields([{ name: "Max Rarity:", value: `${artifact.max_rarity}⭐`, inline: true }]);
                if (artifact["1-piece_bonus"]) giEmbed.addFields([{ name: "1-Piece Bonus:", value: artifact["1-piece_bonus"], inline: false }]);
                if (artifact["2-piece_bonus"]) giEmbed.addFields([{ name: "2-Piece Bonus:", value: artifact["2-piece_bonus"], inline: false }]);
                if (artifact["3-piece_bonus"]) giEmbed.addFields([{ name: "3-Piece Bonus:", value: artifact["3-piece_bonus"], inline: false }]);
                if (artifact["4-piece_bonus"]) giEmbed.addFields([{ name: "4-Piece Bonus:", value: artifact["4-piece_bonus"], inline: false }]);
                if (artifact["5-piece_bonus"]) giEmbed.addFields([{ name: "5-Piece Bonus:", value: artifact["5-piece_bonus"], inline: false }]);
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
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a character.",
        options: [{
            name: "character",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify character by name.",
            autocomplete: true,
            required: true
        }, {
            name: "detailed",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Show detailed info.",
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "weapon",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a weapon.",
        options: [{
            name: "weapon",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify weapon by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "artifact",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on an artifact.",
        options: [{
            name: "artifact",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify artifact by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }]
};