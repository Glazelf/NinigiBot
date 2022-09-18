exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const fs = require("fs");
        const path = require("path");
        const axios = require("axios");
        const randomNumber = require('../../util/randomNumber');
        // Language JSON
        const splatoonLanguages = require("../../objects/splatoon/languages.json");
        // Game data
        const GearInfoClothesJSON = require("../../submodules/leanny.github.io/splat3/data/mush/110/GearInfoClothes.json");
        const GearInfoHeadJSON = require("../../submodules/leanny.github.io/splat3/data/mush/110/GearInfoHead.json");
        const GearInfoShoesJSON = require("../../submodules/leanny.github.io/splat3/data/mush/110/GearInfoShoes.json");
        const WeaponInfoMainJSON = require("../../submodules/leanny.github.io/splat3/data/mush/110/WeaponInfoMain.json");
        const WeaponInfoSpecialJSON = require("../../submodules/leanny.github.io/splat3/data/mush/110/WeaponInfoSpecial.json");
        const WeaponInfoSubJSON = require("../../submodules/leanny.github.io/splat3/data/mush/110/WeaponInfoSub.json");

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        let languageDefault = "EUen";
        let languageUsed = languageDefault;
        let languageJSON = null;
        let languageArg = interaction.options.getString("language");
        if (languageArg && Object.keys(splatoonLanguages).includes(languageArg)) languageUsed = languageArg;
        languageJSON = require(`../../submodules/leanny.github.io/splat3/data/language/${languageUsed}.json`);

        let inputID;
        let github = `https://github.com/Leanny/leanny.github.io/blob/master/splat3/`;
        let schedulesAPI = `https://splatoon3.ink/data/schedules.json`;
        let weaponListTitle = `${languageJSON["LayoutMsg/Cmn_Menu_00"]["L_BtnMap_05-T_Text_00"]}:`;
        let splat3Embed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);
        switch (interaction.options.getSubcommand()) {
            case "clothing":
                inputID = interaction.options.getString("clothing");
                let allClothesJSON = GearInfoHeadJSON.concat(GearInfoClothesJSON, GearInfoShoesJSON); // Using concat on objects because the JSON files are actually an array of unnamed objects despite being typed as object. Don't worry about it.
                // Doesn't always find the correct item despite its existence
                let clothingObject = await Object.values(allClothesJSON).find(clothing => clothing.__RowId.includes(inputID));
                if (!clothingObject) return sendMessage({ client: client, interaction: interaction, content: `Couldn't find that piece of clothing. Make sure you select an autocomplete option.` });
                // Rarity
                let star = "⭐";
                let clothingAuthor = languageJSON["CommonMsg/Gear/GearName_Clothes"][inputID];
                if (clothingObject.__RowId.startsWith("Shs")) clothingAuthor = languageJSON["CommonMsg/Gear/GearName_Shoes"][inputID];
                if (clothingObject.__RowId.startsWith("Hed")) clothingAuthor = languageJSON["CommonMsg/Gear/GearName_Head"][inputID];
                if (!clothingAuthor) clothingAuthor = inputID;
                let starRating = star.repeat(clothingObject.Rarity);
                if (starRating.length > 0) clothingAuthor = `${clothingAuthor} (${starRating})`;
                // Obtainability
                let shopsTitle = languageJSON["LayoutMsg/Cmn_Menu_00"]["T_Shop_00"];
                let ObtainMethod = clothingObject.HowToGet;
                if (ObtainMethod == "Shop") ObtainMethod = `${shopsTitle} (${clothingObject.Price})`;

                let abilityTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["001"]}:`;
                let brandTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["002"]}:`;
                let slotsTitle = `${languageJSON["LayoutMsg/Cmn_Menu_00"]["L_Player_02-T_BlackText_00"]}:`;
                let brandImage = `${github}images/brand/${clothingObject.Brand}.png?raw=true`;
                let abilityImage = `${github}images/skill/${clothingObject.Skill}.png?raw=true`;
                let clothingImage = `${github}images/gear/${clothingObject.__RowId}.png?raw=true`;

                splat3Embed
                    .setAuthor({ name: clothingAuthor, iconURL: brandImage })
                    .setThumbnail(abilityImage)
                    .addField(abilityTitle, `${languageJSON["CommonMsg/Gear/GearPowerName"][clothingObject.Skill]}*`, true)
                    .addField(slotsTitle, (clothingObject.Rarity + 1).toString(), true)
                    .addField(brandTitle, languageJSON["CommonMsg/Gear/GearBrandName"][clothingObject.Brand], true)
                    .addField("Obtain Method:", ObtainMethod, true)
                    .setImage(clothingImage)
                    .setFooter({ text: "*Main abilities can differ because of SplatNet or Murch." });
                break;
            case "weapon":
                inputID = interaction.options.getString("weapon");
                let weaponObject = await Object.values(WeaponInfoMainJSON).find(weapon => weapon.GameActor.includes(inputID));
                if (!weaponObject) return sendMessage({ client: client, interaction: interaction, content: `Couldn't find that weapon. Make sure you select an autocomplete option.` });

                let weaponAuthor = languageJSON["CommonMsg/Weapon/WeaponName_Main"][inputID];
                if (!weaponAuthor) weaponAuthor = inputID;
                let weaponStats = "";
                let specialID = weaponObject.SpecialWeapon.split("/");
                specialID = specialID[specialID.length - 1].split(".")[0];
                let subID = weaponObject.SubWeapon.split("/");
                subID = subID[subID.length - 1].split(".")[0];

                await weaponObject.UIParam.forEach(stat => {
                    weaponStats += `\n${languageJSON["CommonMsg/Weapon/WeaponParamName"][stat.Type]}: ${stat.Value}/100`;
                });
                let specialPointsTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["L_DetailWpn_00-T_Special_00"]}:`;
                weaponStats += `\n${specialPointsTitle} ${weaponObject.SpecialPoint}`;

                let subTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["004"]}:`;
                let specialTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["005"]}:`;
                let shopTitle = `${languageJSON["CommonMsg/Glossary"]["WeaponShop"]}:`;
                let infoTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["L_GuideBtn_01-T_Info_00"]}:`;
                let levelString = `${languageJSON["CommonMsg/UnitName"]["WeaponUnlockRank"]}`;
                if (levelString.includes("[")) levelString = levelString.split(" ")[0];
                let subImage = `${github}images/subspe/Wsb_${subID}00.png?raw=true`;
                let specialImage = `${github}images/subspe/Wsp_${specialID}00.png?raw=true`;
                let weaponImage = `${github}images/weapon/Wst_${inputID}.png?raw=true`;

                splat3Embed
                    .setAuthor({ name: weaponAuthor, iconURL: subImage })
                    .setThumbnail(specialImage)
                    .addField(subTitle, languageJSON["CommonMsg/Weapon/WeaponName_Sub"][subID], true)
                    .addField(specialTitle, languageJSON["CommonMsg/Weapon/WeaponName_Special"][specialID], true)
                    .addField(shopTitle, `${levelString} ${weaponObject.ShopUnlockRank}+`, true)
                    .addField(infoTitle, weaponStats, false)
                    .setImage(weaponImage);
                break;
            case "subweapon":
                inputID = interaction.options.getString("subweapon");
                let subweaponMatches = await Object.values(WeaponInfoMainJSON).filter(weapon => {
                    let weaponSubID = weapon.SubWeapon.split("/");
                    weaponSubID = weaponSubID[weaponSubID.length - 1].split(".")[0];
                    if (weapon.__RowId.endsWith("_Coop") || weapon.__RowId.endsWith("_Msn") || weapon.__RowId.includes("_Rival") && weapon.__RowId.includes("_AMB_")) return false;
                    if (inputID == weaponSubID) return true;
                });
                if (subweaponMatches.length < 1) return sendMessage({ client: client, interaction: interaction, content: `Couldn't find that subweapon. Make sure you select an autocomplete option.` });
                let allSubweaponMatchesNames = "";
                subweaponMatches.forEach(subweapon => {
                    allSubweaponMatchesNames += `${languageJSON["CommonMsg/Weapon/WeaponName_Main"][subweapon.__RowId]}\n`;
                });
                let subThumbnail = `${github}images/subspe/Wsb_${inputID}00.png?raw=true`;

                let subName = languageJSON["CommonMsg/Weapon/WeaponName_Sub"][inputID];
                let subDescription = languageJSON["CommonMsg/Weapon/WeaponExp_Sub"][inputID]
                    .replace("\\n", " ")
                    .replace("[group=0003 type=000a params=00 00 80 3f 00 00 00 00]", "**R**");

                splat3Embed
                    .setAuthor({ name: subName })
                    .setThumbnail(subThumbnail)
                    .setDescription(subDescription)
                    .addField(weaponListTitle, allSubweaponMatchesNames, false);
                break;
            case "special":
                inputID = interaction.options.getString("special");
                let specialWeaponMatches = await Object.values(WeaponInfoMainJSON).filter(weapon => {
                    let weaponSpecialID = weapon.SpecialWeapon.split("/");
                    weaponSpecialID = weaponSpecialID[weaponSpecialID.length - 1].split(".")[0];
                    if (weapon.__RowId.endsWith("_Coop") || weapon.__RowId.endsWith("_Msn") || weapon.__RowId.includes("_Rival") && weapon.__RowId.includes("_AMB_")) return false;
                    if (inputID == weaponSpecialID) return true;
                });
                if (specialWeaponMatches.length < 1) return sendMessage({ client: client, interaction: interaction, content: `Couldn't find that special weapon. Make sure you select an autocomplete option.` });
                let allSpecialWeaponMatchesNames = "";
                specialWeaponMatches.forEach(specialweapon => {
                    allSpecialWeaponMatchesNames += `${languageJSON["CommonMsg/Weapon/WeaponName_Main"][specialweapon.__RowId]}\n`;
                });
                let specialThumbnail = `${github}images/subspe/Wsp_${inputID}00.png?raw=true`;

                let specialName = languageJSON["CommonMsg/Weapon/WeaponName_Special"][inputID];
                let specialDescription = languageJSON["CommonMsg/Weapon/WeaponExp_Special"][inputID]
                    .replace("\\n", " ")
                    .replaceAll("[group=0003 type=000c params=00 00 80 3f 00 00 00 00]", "**ZR**").replaceAll("[group=0003 type=000a params=00 00 80 3f 00 00 00 00]", "**R**").replaceAll("[group=0003 type=000b params=00 00 80 3f 00 00 00 00]", "**ZL**").replaceAll("[group=0003 type=0001 params=00 00 80 3f 00 00 00 00]", "**B**");

                splat3Embed
                    .setAuthor({ name: specialName })
                    .setThumbnail(specialThumbnail)
                    .setDescription(specialDescription)
                    .addField(weaponListTitle, allSpecialWeaponMatchesNames, false);
                break;
            case "schedule":
                let inputData = interaction.options.getString("mode");
                let modeName = inputData.split("|")[0];
                let inputMode = inputData.split("|")[1];
                let submode = inputData.split("|")[2];
                let modeIndex = null;
                if (submode == "series") modeIndex = 0;
                if (submode == "open") modeIndex = 1;
                let turfWarID = "regularSchedules";
                let rankedID = "bankaraSchedules";
                let salmonRunID = "coopGroupingSchedule";

                let allowedModes = [turfWarID, anarchyID, salmonRunID];
                if (!allowedModes.includes(inputMode)) return sendMessage({ client: client, interaction: interaction, content: `We don't have schedules for the mode you provided (yet!) or that mode does not exist.` });

                let responseSchedules = await axios.get(schedulesAPI);
                if (responseSchedules.status != 200) return sendMessage({ client: client, interaction: interaction, content: `Error occurred getting schedule data. Please try again later.` });
                let scheduleData = responseSchedules.data.data[inputMode];
                if (inputMode == salmonRunID) scheduleData = scheduleData.regularSchedules;
                let scheduleMode = inputMode.split("Schedule")[0];

                let currentTime = new Date().valueOf();
                let currentMaps = scheduleData.nodes.find(entry => Date.parse(entry.startTime) < currentTime);
                let upcomingMaps = scheduleData.nodes.find(entry => entry !== currentMaps && Date.parse(entry.startTime) < currentTime + (2 * 60 * 60 * 1000)); // Add 2 hours to current time

                let randomStageIndex = randomNumber(0, 1);
                let modeSettings = `${scheduleMode}MatchSetting`;
                if (!currentMaps[`${scheduleMode}MatchSetting`]) modeSettings = `${scheduleMode}MatchSettings`;
                let entrySettings = currentMaps[modeSettings];
                if (inputMode == anarchyID) entrySettings = entrySettings[modeIndex];
                let currentMapsSettings = entrySettings;

                splat3Embed.setAuthor({ name: modeName });
                if (inputMode == salmonRunID) {
                    // Add functionality for big run whenever that gets added
                    await scheduleData.nodes.forEach(async (entry) => {
                        let salmonRotationTime = `<t:${Date.parse(entry.startTime) / 1000}:f>`;
                        let weaponString = "";
                        await entry.setting.weapons.forEach(weapon => {
                            weaponString += `${weapon.name}\n`;
                        });
                        splat3Embed.addField(`${salmonRotationTime}\n${entry.setting.coopStage.name}`, `${weaponString}`, true);
                    });
                    splat3Embed
                        .setImage(currentMaps.setting.coopStage.thumbnailImage.url)
                        .setFooter({ text: `Image is from ${currentMaps.setting.coopStage.name}.` });
                } else {
                    await scheduleData.nodes.forEach(entry => {
                        entrySettings = entry[modeSettings];
                        let mapEntryTimes = `<t:${Date.parse(entry.startTime) / 1000}:t>-<t:${Date.parse(entry.endTime) / 1000}:t>`;
                        let mapEntryTitle = `Maps ${mapEntryTimes}`;
                        if (inputMode == anarchyID) {
                            entrySettings = entrySettings[modeIndex];
                            mapEntryTitle = `${mapEntryTimes}\n${entrySettings.vsRule.name}`;
                        };
                        let entryMaps = `${entrySettings.vsStages[0].name}\n${entrySettings.vsStages[1].name}`;
                        splat3Embed.addField(mapEntryTitle, `${entrySettings.vsStages[0].name}\n${entrySettings.vsStages[1].name}`, true);
                    });
                    splat3Embed
                        .setImage(currentMapsSettings.vsStages[randomStageIndex].image.url)
                        .setFooter({ text: `Image is from ${currentMapsSettings.vsStages[randomStageIndex].name}.` });
                };
                break;
            case "splashtag-random":
                let userTitle = interaction.member.nickname;
                if (!userTitle) userTitle = interaction.user.username;

                let adjectives = Object.values(languageJSON["CommonMsg/Byname/BynameAdjective"]).filter(adjective => !adjective.includes("[") && adjective !== "");
                let randomAdjective = adjectives[randomNumber(0, adjectives.length - 1)];
                let subjects = Object.values(languageJSON["CommonMsg/Byname/BynameSubject"]).filter(subject => !subject.includes("[") && subject !== "");
                let randomSubject = subjects[randomNumber(0, subjects.length - 1)];

                let reversedLanguages = ["EUfr", "EUes", "EUit"];
                let randomTitle = `${randomAdjective} ${randomSubject}`;
                if (reversedLanguages.includes(languageUsed)) randomTitle = `${randomSubject} ${randomAdjective}`;

                const bannerFolder = path.resolve(__dirname, "../../submodules/leanny.github.io/splat3/images/npl/");
                const badgeFolder = path.resolve(__dirname, "../../submodules/leanny.github.io/splat3/images/badge/");
                let bannerOptions = fs.readdirSync(bannerFolder).filter(file => file.endsWith(".png"));
                let badgeOptions = fs.readdirSync(badgeFolder).filter(file => file.endsWith(".png"));
                let bannerRandom = bannerOptions[randomNumber(0, bannerOptions.length - 1)];
                let badgeRandom = badgeOptions[randomNumber(0, badgeOptions.length - 1)];
                let badgeRandom2 = badgeOptions[randomNumber(0, badgeOptions.length - 1)];
                let badgeRandom3 = badgeOptions[randomNumber(0, badgeOptions.length - 1)];

                splat3Embed
                    .setAuthor({ name: randomTitle, iconURL: `${github}images/badge/${badgeRandom}?raw=true` })
                    .setTitle(userTitle)
                    .setDescription(`#${interaction.user.discriminator}`)
                    .setThumbnail(`${github}images/badge/${badgeRandom2}?raw=true`)
                    .setImage(`${github}images/npl/${bannerRandom}?raw=true`)
                    .setFooter({ text: "Report grammar errors on Github!", iconURL: `${github}images/badge/${badgeRandom3}?raw=true` })
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
            name: "language",
            type: "STRING",
            description: "Specify a language.",
            autocomplete: true
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
            description: "Specify a weapon by name.",
            autocomplete: true,
            required: true
        }, {
            name: "language",
            type: "STRING",
            description: "Specify a language.",
            autocomplete: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "subweapon",
        type: "SUB_COMMAND",
        description: "Get info on a subweapon.",
        options: [{
            name: "subweapon",
            type: "STRING",
            description: "Specify a subweapon by name.",
            autocomplete: true,
            required: true
        }, {
            name: "language",
            type: "STRING",
            description: "Specify a language.",
            autocomplete: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "special",
        type: "SUB_COMMAND",
        description: "Get info on a special weapon.",
        options: [{
            name: "special",
            type: "STRING",
            description: "Specify a special weapon by name.",
            autocomplete: true,
            required: true
        }, {
            name: "language",
            type: "STRING",
            description: "Specify a language.",
            autocomplete: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "schedule",
        type: "SUB_COMMAND",
        description: "Get a mode's schedule.",
        options: [{
            name: "mode",
            type: "STRING",
            description: "Specify a mode.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "splashtag-random",
        type: "SUB_COMMAND",
        description: "Generate a random splashtag.",
        options: [{
            name: "language",
            type: "STRING",
            description: "Specify a language.",
            autocomplete: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};