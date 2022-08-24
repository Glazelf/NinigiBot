exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const getNames = require('../../util/splat3/getNames');
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
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });
        // Add language arg?
        let languageJSON = EUEnglishJSON;

        let inputID;
        let demoDisclaimer = `Note that this command currently uses data from a datamine of the Splatoon 3 Splatfest World Premier.\nThis causes data to be unstable, incomplete and prone to error.`;
        let github = `https://github.com/Leanny/leanny.github.io/blob/master/splat3/`;
        let splat3Embed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);

        switch (interaction.options.getSubcommand()) {
            case "clothing":
                inputID = interaction.options.getString("clothing");
                const clothingIDs = getNames(languageJSON, "clothes");
                let allClothesJSON = {
                    ...GearInfoHeadJSON,
                    ...GearInfoClothesJSON,
                    ...GearInfoShoesJSON
                };
                // Doesn't always find the correct item despite its existence
                let clothingObject = await Object.values(allClothesJSON).find(clothing => clothing.LObjParam.includes(inputID));
                if (!clothingObject) return sendMessage({ client: client, interaction: interaction, content: `Couldn't find that piece of clothing. Make sure you select an autocomplete option.\n${demoDisclaimer}` });

                let star = "⭐";
                let rarity = star.repeat(clothingObject.Rarity);

                let clothingAuthor = languageJSON[inputID];
                if (rarity.length > 0) clothingAuthor = `${languageJSON[inputID]} (${rarity})`;

                let ObtainMethod = clothingObject.HowToGet;
                if (ObtainMethod == "Shop") ObtainMethod = `${ObtainMethod} (${clothingObject.Price})`;

                let brandImage = `${github}images/brand/${clothingObject.Brand}.png?raw=true`;
                let clothingImage = `${github}images/gear/${clothingObject.__RowId}.png?raw=true`;
                splat3Embed
                    .setAuthor({ name: clothingAuthor })
                    .setThumbnail(brandImage)
                    .addField("Brand:", languageJSON[clothingObject.Brand], true)
                    .addField("Main Skill:", languageJSON[clothingObject.Skill], true)
                    .addField("Obtain Method:", ObtainMethod, true)
                    .setImage(clothingImage)
                break;
            case "weapon":
                inputID = interaction.options.getString("weapon");
                const weaponIDs = getNames(languageJSON, "weapons");
                let weaponObject = await Object.values(WeaponInfoMainJSON).find(weapon => weapon.GameActor.includes(inputID));
                if (!weaponObject) return sendMessage({ client: client, interaction: interaction, content: `Couldn't find that weapon. Make sure you select an autocomplete option.\n${demoDisclaimer}` });

                let weaponStats = "";
                let specialID = weaponObject.SpecialWeapon.split("/");
                specialID = specialID[specialID.length - 1].split(".")[0];
                let subID = weaponObject.SubWeapon.split("/");
                subID = subID[subID.length - 1].split(".")[0];
                weaponStats += `\nSpecial: ${languageJSON[specialID]}`;
                weaponStats += `\nSub: ${languageJSON[subID]}`;

                await weaponObject.UIParam.forEach(stat => {
                    weaponStats += `\n${stat.Type}: ${stat.Value}`;
                });
                weaponStats += `\nSpecial Points: ${weaponObject.SpecialPoint}`;

                let subImage = `${github}images/subspe/Wsb_${subID}00.png?raw=true`;
                let specialImage = `${github}images/subspe/Wsp_${specialID}00.png?raw=true`;
                let weaponImage = `${github}images/weapon/Wst_${inputID}.png?raw=true`;

                splat3Embed
                    .setAuthor({ name: languageJSON[inputID], iconURL: subImage })
                    .setThumbnail(specialImage)
                    .setDescription(weaponStats)
                    .addField("Shop:", `${weaponObject.ShopPrice} from rank ${weaponObject.ShopUnlockRank}`)
                    .setImage(weaponImage)
                break;
        };

        return sendMessage({ client: client, interaction: interaction, content: demoDisclaimer, embeds: splat3Embed });

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