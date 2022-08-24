exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const getClothes = require('../../util/splat3/getClothes');
        // Language JSON
        const chineseJSON = require("../../submodules/leanny.github.io/splat3/data/language/CNzh.json");
        const EUGermanJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUde.json");
        const EUEnglishJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUen.json");
        const EUSpanishJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUes.json");
        const EUFrenchJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUfr.json");
        const EUItalianJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUit.json");
        const EUDutchJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUnl.json");
        const EURussianJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUru.json");
        const japaneseJSON = require("../../submodules/leanny.github.io/splat3/data/language/JPja.json");
        const koreanJSON = require("../../submodules/leanny.github.io/splat3/data/language/KRko.json");
        const taiwaneseJSON = require("../../submodules/leanny.github.io/splat3/data/language/TWzh.json");
        const USEnglishJSON = require("../../submodules/leanny.github.io/splat3/data/language/USen.json");
        const USSpanishJSON = require("../../submodules/leanny.github.io/splat3/data/language/USes.json");
        const USFrenchJSON = require("../../submodules/leanny.github.io/splat3/data/language/USfr.json");
        // Game data
        const GearInfoClothesJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/GearInfoClothes.json");
        const GearInfoHeadJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/GearInfoHead.json");
        const GearInfoShoesJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/GearInfoShoes.json");
        const WeaponInfoMainJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/WeaponInfoMain.json");
        const WeaponInfoSpecialJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/WeaponInfoSpecial.json");
        const WeaponInfoSubJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/WeaponInfoSub.json");

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });
        // Add language arg?
        let languageJSON = EUEnglishJSON;

        let github = `https://github.com/Leanny/leanny.github.io/`;
        let splat3Embed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);

        switch (interaction.options.getSubcommand()) {
            case "clothing":
                let inputID = interaction.options.getString("clothing");
                const clothesIDs = getClothes(languageJSON);
                let allClothesJSON = {
                    ...GearInfoHeadJSON,
                    ...GearInfoClothesJSON,
                    ...GearInfoShoesJSON
                };
                // Doesn't always find the correct item despite its existence
                let clothingPiece = await Object.values(allClothesJSON).find(clothing => clothing.LObjParam.includes(inputID));
                if (!clothingPiece) return sendMessage({ client: client, interaction: interaction, content: `Couldn't find that piece of clothing. Make sure you select an autocomplete option.\nNote that this command currently being based on a datamine of the Splatoon 3 Splatfest World Premier, data is unstable, incomplete and prone to error.` });
                console.log(clothingPiece)

                let star = "⭐";
                let rarity = star.repeat(clothingPiece.Rarity);

                let clothingAuthor = languageJSON[inputID];
                if (rarity.length > 0) clothingAuthor = `${languageJSON[inputID]} (${rarity})`;

                splat3Embed
                    .setAuthor({ name: clothingAuthor, iconURL: `${github}blob/master/splat3/images/brand/${clothingPiece.Brand}.png?raw=true` })
                    .setThumbnail(`${github}blob/master/splat3/images/gear/${clothingPiece.__RowId}.png?raw=true`)
                    .addField("Brand:", languageJSON[clothingPiece.Brand], true)
                    .addField("Main Skill:", languageJSON[clothingPiece.Skill], true)
                    .addField("How to get:", clothingPiece.HowToGet, true)
                break;
            case "weapon":
                break;
        };

        return sendMessage({ client: client, interaction: interaction, embeds: splat3Embed });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "splatoon3",
    description: `Shows Splatoon 3 data.`,
    options: [{
        name: "clothing",
        type: "SUB_COMMAND",
        description: "Get info on clothing.",
        options: [{
            name: "clothing",
            type: "STRING",
            description: "Specify a piece of clothing by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "weapon",
        type: "SUB_COMMAND",
        description: "Get info on a weapon..",
        options: [{
            name: "weapon",
            type: "STRING",
            description: "Specify a weapon by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};