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
        let version = 200;
        let versionString = `Splatoon 3 v${version.toString().split("").join(".")}`;
        const GearInfoClothesJSON = require(`../../submodules/leanny.github.io/splat3/data/mush/${version}/GearInfoClothes.json`);
        const GearInfoHeadJSON = require(`../../submodules/leanny.github.io/splat3/data/mush/${version}/GearInfoHead.json`);
        const GearInfoShoesJSON = require(`../../submodules/leanny.github.io/splat3/data/mush/${version}/GearInfoShoes.json`);
        const WeaponInfoMainJSON = require(`../../submodules/leanny.github.io/splat3/data/mush/${version}/WeaponInfoMain.json`);
        const WeaponInfoSpecialJSON = require(`../../submodules/leanny.github.io/splat3/data/mush/${version}/WeaponInfoSpecial.json`);
        const WeaponInfoSubJSON = require(`../../submodules/leanny.github.io/splat3/data/mush/${version}/WeaponInfoSub.json`);

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
        let responseSplatfest;
        let splatfestData;
        let splatfestTeamIndex = 0;
        let star = "⭐";
        let github = `https://github.com/Leanny/leanny.github.io/blob/master/splat3/`;
        let schedulesAPI = `https://splatoon3.ink/data/schedules.json`; // Includes all schedules.
        let splatnetAPI = `https://splatoon3.ink/data/gear.json`; // SplatNet gear data.
        let salmonRunGearAPI = `https://splatoon3.ink/data/coop.json`; // Current Salmon Run gear reward.
        let splatfestAPI = `https://splatoon3.ink/data/festivals.json`; // All Splatfest results.
        let replayAPI = `https://splatoon3-replay-lookup.fancy.org.uk/api/splatnet3/replay/`; // Replay lookup.
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
                    .setFooter({ text: `${versionString} | *Main abilities can differ because of SplatNet or Murch.` });
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
                    .setImage(weaponImage)
                    .setFooter(versionString);
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
                    .addField(weaponListTitle, allSubweaponMatchesNames, false)
                    .setFooter(versionString);
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
                    .addField(weaponListTitle, allSpecialWeaponMatchesNames, false)
                    .setFooter(versionString);
                break;
            case "schedule":
                let inputData = interaction.options.getString("mode");
                let modeName = inputData.split("|")[0];
                let inputMode = inputData.split("|")[1];
                let submode = inputData.split("|")[2];
                let modeIndex = null;
                if (submode == "series") modeIndex = 0;
                if (submode == "open") modeIndex = 1;
                let responseSchedules = await axios.get(schedulesAPI);
                if (responseSchedules.status != 200) return sendMessage({ client: client, interaction: interaction, content: `Error occurred getting schedule data. Please try again later.` });
                let currentFest = responseSchedules.data.data.currentFest;

                let turfWarID = "regularSchedules";
                let anarchyID = "bankaraSchedules";
                let salmonRunID = "coopGroupingSchedule";
                let xBattleID = "xSchedules";
                let leagueBattleID = "leagueSchedules";
                let splatfestBattleID = "festSchedules";
                let allowedModes = [];
                allowedModes.push(salmonRunID);
                if (currentFest) {
                    allowedModes.push(splatfestBattleID);
                } else {
                    allowedModes.push(turfWarID, anarchyID, xBattleID); // leagueBattleID when it becomes available
                };
                if (!allowedModes.includes(inputMode)) return sendMessage({ client: client, interaction: interaction, content: `That mode either does not exist or is not currently available ingame.` });

                let scheduleData = responseSchedules.data.data[inputMode];
                let currentBigRun = null;
                if (inputMode == salmonRunID) {
                    scheduleData = scheduleData.regularSchedules;
                    currentBigRun = responseSchedules.data.data[inputMode].bigRunSchedules.nodes[0];
                };
                let scheduleMode = inputMode.split("Schedule")[0];

                let currentTime = new Date().valueOf();
                let currentMaps = null;
                let upcomingMaps = null;
                if (!currentBigRun) currentMaps = scheduleData.nodes.find(entry => Date.parse(entry.startTime) < currentTime);
                upcomingMaps = scheduleData.nodes.find(entry => entry !== currentMaps && Date.parse(entry.startTime) < currentTime + (2 * 60 * 60 * 1000)); // Add 2 hours to current time

                let randomStageIndex = randomNumber(0, 1);
                let modeSettings = `${scheduleMode}MatchSetting`;
                if (currentMaps && !currentMaps[`${scheduleMode}MatchSetting`]) modeSettings = `${scheduleMode}MatchSettings`;
                let entrySettings = null;
                if (currentMaps) entrySettings = currentMaps[modeSettings];
                if (inputMode == anarchyID) entrySettings = entrySettings[modeIndex];
                let currentMapsSettings = entrySettings;

                splat3Embed.setAuthor({ name: modeName });
                if (inputMode == salmonRunID) {
                    // Salmon Run
                    let responseSalmonRunGear = await axios.get(salmonRunGearAPI);
                    if (responseSalmonRunGear.status == 200) {
                        splat3Embed
                            .setDescription(`Monthly Gear: ${responseSalmonRunGear.data.data.coopResult.monthlyGear.name}`)
                            .setThumbnail(responseSalmonRunGear.data.data.coopResult.monthlyGear.image.url);
                    };
                    if (currentBigRun) splat3Embed.setDescription(`⚠️ Big Run ⚠️\nStart: <t:${Date.parse(currentBigRun.startTime) / 1000}:f>\nEnd: <t:${Date.parse(currentBigRun.endTime) / 1000}:f>\nMap: **${currentBigRun.setting.coopStage.name}**.\nWeapons: Random`);
                    await scheduleData.nodes.forEach(async (entry) => {
                        let salmonRotationTime = `<t:${Date.parse(entry.startTime) / 1000}:f>`;
                        let weaponString = "";
                        await entry.setting.weapons.forEach(weapon => {
                            weaponString += `${weapon.name}\n`;
                        });
                        splat3Embed.addField(`${salmonRotationTime}\n${entry.setting.coopStage.name}`, `${weaponString}`, true);
                    });
                    if (currentBigRun && Date.now() >= Date.parse(currentBigRun.startTime)) {
                        splat3Embed.setImage(currentBigRun.setting.coopStage.image.url);
                    } else {
                        splat3Embed
                            .setImage(currentMaps.setting.coopStage.thumbnailImage.url)
                            .setFooter({ text: `Image is from ${currentMaps.setting.coopStage.name}.` });
                    };
                } else if (inputMode == splatfestBattleID) {
                    // Splatfest
                    let splatfestScheduleDescription = `${currentFest.title}\n`;
                    responseSplatfest = await axios.get(splatfestAPI);
                    splatfestData = responseSplatfest.data.EU.data.festRecords.nodes.find(fest => fest.startTime == currentFest.startTime);
                    let splatfestDefender = null;
                    await splatfestData.teams.forEach(team => {
                        if (splatfestTeamIndex !== 0) splatfestScheduleDescription += " vs. ";
                        splatfestTeamIndex++;
                        splatfestScheduleDescription += team.teamName;
                        if (team.role == "DEFENSE") splatfestDefender = team.teamName;
                    });
                    splatfestScheduleDescription += `\nDuration: <t:${Date.parse(currentFest.startTime) / 1000}:f>-<t:${Date.parse(currentFest.endTime) / 1000}:f>`;
                    let tricolorSchedule = `<t:${Date.parse(currentFest.midtermTime) / 1000}:f>-<t:${Date.parse(currentFest.endTime) / 1000}:f>`;
                    if (splatfestDefender) tricolorSchedule += `\nDefense: Team ${splatfestDefender}`;
                    tricolorSchedule += `\n${currentFest.tricolorStage.name}`;
                    splat3Embed
                        .setDescription(splatfestScheduleDescription)
                        .addField("Tricolor Battle:", tricolorSchedule, false)
                        .setImage(splatfestData.image.url);
                };
                if ([turfWarID, anarchyID, splatfestBattleID, xBattleID].includes(inputMode)) {
                    // Turf War & Anarchy
                    await scheduleData.nodes.forEach(entry => {
                        entrySettings = entry[modeSettings];
                        let mapEntryTimes = `<t:${Date.parse(entry.startTime) / 1000}:t>-<t:${Date.parse(entry.endTime) / 1000}:t>`;
                        let mapEntryTitle = `Maps ${mapEntryTimes}`;
                        if (inputMode == anarchyID) {
                            entrySettings = entrySettings[modeIndex];
                            mapEntryTitle = `${mapEntryTimes}\n${entrySettings.vsRule.name}`;
                        };
                        if (!entrySettings) return;
                        let entryMaps = `${entrySettings.vsStages[0].name}\n${entrySettings.vsStages[1].name}`;
                        splat3Embed.addField(mapEntryTitle, `${entrySettings.vsStages[0].name}\n${entrySettings.vsStages[1].name}`, true);
                    });
                    if ([turfWarID, anarchyID, xBattleID].includes(inputMode)) {
                        splat3Embed
                            .setImage(currentMapsSettings.vsStages[randomStageIndex].image.url)
                            .setFooter({ text: `Image is from ${currentMapsSettings.vsStages[randomStageIndex].name}.` });
                    };
                };
                break;
            case "splatnet":
                let responseSplatnet = await axios.get(splatnetAPI);
                if (responseSplatnet.status != 200) return sendMessage({ client: client, interaction: interaction, content: `Error occurred getting SplatNet3 data. Please try again later.` });
                let splatnetData = responseSplatnet.data.data.gesotown;
                // Limited time brand
                splat3Embed.addField(`Daily Drop (${splatnetData.pickupBrand.brand.name})`, `${splatnetData.pickupBrand.brand.name} Common Ability: ${splatnetData.pickupBrand.brand.usualGearPower.name}\nDaily Drop (${splatnetData.pickupBrand.nextBrand.name}) starts <t:${Date.parse(splatnetData.pickupBrand.saleEndTime) / 1000}:R>.`, false);
                await splatnetData.pickupBrand.brandGears.forEach(brandGear => {
                    let brandGearString = getGearString(brandGear, "brand");
                    splat3Embed.addField(brandGear.gear.name, brandGearString, true);
                });
                // Individual gear pieces
                splat3Embed.addField("Gear On Sale Now", `New item <t:${Date.parse(splatnetData.limitedGears[0].saleEndTime) / 1000}:R>.`, false);
                await splatnetData.limitedGears.forEach(limitedGear => {
                    let limitedGearString = getGearString(limitedGear, "limited");
                    splat3Embed.addField(limitedGear.gear.name, limitedGearString, true);
                });

                splat3Embed
                    .setAuthor({ name: "SplatNet3 Shop" })
                    .setImage(splatnetData.pickupBrand.image.url)
                    .setFooter({ text: `${splatnetData.pickupBrand.brand.name} promotional image.` });
                break;
            case "splatfests":
                // Command needs a rework once there is 1 finished Splatfest to show results, and then again when there's a second scheduled Splatfest to make sure ordering and comparisons work properly
                responseSplatfest = await axios.get(splatfestAPI);
                if (responseSplatfest.status != 200) return sendMessage({ client: client, interaction: interaction, content: `Error occurred getting Splatfest data. Please try again later.` });
                splatfestData = responseSplatfest.data.EU.data.festRecords.nodes; // Usage is under the assumption that splatfests are identical between regions now. If not, a region argument should be added.
                let splatfestBanner = null;
                let isUpcomingOrOngoingSplatfest = false;
                splatfestData = await splatfestData.sort((a, b) => Date.parse(b.endTime) - Date.parse(a.endTime));
                await splatfestData.forEach(async (splatfest) => {
                    splatfestTeamIndex = 0;
                    let splatfestTitle = splatfest.title;
                    let splatfestDescription = "";
                    if (!splatfestBanner) splatfestBanner = splatfest.image.url;
                    switch (splatfest.state) {
                        case "SCHEDULED":
                            splatfestTitle = `⚠️UPCOMING⚠️\n${splatfestTitle}`;
                            isUpcomingOrOngoingSplatfest = true;
                            break;
                        case "FIRST_HALF":
                        case "SECOND_HALF":
                            splatfestTitle = `🥳ONGOING🥳\n${splatfestTitle}`;
                            isUpcomingOrOngoingSplatfest = true;
                            break;
                        case "CLOSED":
                            break;
                        default:
                            break;
                    };
                    let midTermWinner = null;
                    let splatfestResultsTitle = "**Results:** ({1})";
                    let splatfestResultsTitleTeams = "";
                    let splatfestResultsDescription = "";
                    let splatfestResultsVote = "Popularity: ";
                    let splatfestResultsHoragai = "Conch Shells: ";
                    let splatfestResultsRegular = "Regular Battles: ";
                    let splatfestResultsChallenge = "Pro Battles: ";
                    let splatfestResultsWinner = "**Winner: {1}**"; // Winner field can be removed if embed bolding works on mobile lol
                    await splatfest.teams.forEach(async (team) => {
                        if (splatfestTeamIndex !== 0) {
                            splatfestDescription += " vs. ";
                            splatfestResultsTitleTeams += "|";
                            splatfestResultsVote += "|";
                            splatfestResultsHoragai += "|";
                            splatfestResultsRegular += "|";
                            splatfestResultsChallenge += "|";
                        };
                        splatfestTeamIndex++;
                        if (team.result && team.result.isWinner) {
                            splatfestDescription += `**${team.teamName}**`;
                            splatfestResultsTitleTeams += `**${team.teamName}**`;
                            splatfestResultsWinner = splatfestResultsWinner.replace("{1}", `Team ${team.teamName}`);
                        } else {
                            splatfestDescription += team.teamName;
                            splatfestResultsTitleTeams += team.teamName;
                        };
                        if (splatfest.state == "CLOSED") {
                            // There HAS to be a cleaner way to do this but i don't care enough to figure it out right now, forEach didn't want to work on the object
                            if (team.result && team.result.isVoteRatioTop) {
                                splatfestResultsVote += `**${Math.round(team.result.voteRatio * 10000) / 100}%**`;
                            } else {
                                splatfestResultsVote += `${Math.round(team.result.voteRatio * 10000) / 100}%`;
                            };
                            if (team.result && team.result.isHoragaiRatioTop) {
                                splatfestResultsHoragai += `**${Math.round(team.result.horagaiRatio * 10000) / 100}%**`;
                            } else {
                                splatfestResultsHoragai += `${Math.round(team.result.horagaiRatio * 10000) / 100}%`;
                            };
                            if (team.result && team.result.isRegularContributionRatioTop) {
                                splatfestResultsRegular += `**${Math.round(team.result.regularContributionRatio * 10000) / 100}%**`;
                            } else {
                                splatfestResultsRegular += `${Math.round(team.result.regularContributionRatio * 10000) / 100}%`;
                            };
                            if (team.result && team.result.isChallengeContributionRatioTop) {
                                splatfestResultsChallenge += `**${Math.round(team.result.challengeContributionRatio * 10000) / 100}%**`;
                            } else {
                                splatfestResultsChallenge += `${Math.round(team.result.challengeContributionRatio * 10000) / 100}%`;
                            };
                        };
                        if (team.role == "DEFENSE") midTermWinner = team.teamName;
                    });
                    if (splatfest.teams[0].result) {
                        splatfestResultsTitle = splatfestResultsTitle.replace("{1}", splatfestResultsTitleTeams);
                        splatfestResultsDescription += `${splatfestResultsVote} (10p)\n${splatfestResultsHoragai} (10p)\n${splatfestResultsRegular} (15p)\n${splatfestResultsChallenge} (10p)\n${splatfestResultsWinner}`;
                    };
                    splatfestDescription += `\n<t:${Date.parse(splatfest.startTime) / 1000}:d>-<t:${Date.parse(splatfest.endTime) / 1000}:d>`;
                    if (midTermWinner) splatfestDescription += `\nTricolor Defense: Team ${midTermWinner}`;
                    if (splatfest.teams[0].result) splatfestDescription += `\n${splatfestResultsTitle}\n${splatfestResultsDescription}`;
                    splat3Embed.addField(splatfestTitle, splatfestDescription, false);
                });

                splat3Embed
                    .setAuthor({ name: "Splatfests" })
                    .setImage(splatfestBanner)
                    .setFooter({ text: "Image is from upcoming or most recent Splatfest." });
                if (!isUpcomingOrOngoingSplatfest) splat3Embed.setDescription("Note: Upcoming Splatfests will only be available here when you can choose a team ingame.");
                break;
            case "replay":
                let replayCode = interaction.options.getString("code");
                replayCode = replayCode.replace("-", "");
                let replayResponse = await axios.get(`${replayAPI}${replayCode.toUpperCase()}`);
                if (replayResponse.status !== 200) return interaction.reply({ content: "Error occurred getting that replay. Make sure the code is correct." });
                let replayData = replayResponse.data.replay.historyDetail;
                let replayIsTurfWar = replayData.vsRule.name == "Turf War";
                // Match data
                let replayTimestamp = `Timestamp: <t:${Date.parse(replayData.playedTime) / 1000}:f>`;
                let replayMode = `${replayData.vsRule.name} Replay`;
                if (!replayIsTurfWar) replayMode += ` (${replayData.vsMode.name})`;
                let replayStage = `Stage: ${replayData.vsStage.name}`;
                let replayResult = `Result: ${replayData.judgement}`;
                if (replayData.knockout !== "NEITHER") {
                    replayResult += ` (KNOCKOUT)`;
                } else if (replayData.myTeam.result.score) {
                    replayResult += ` (83 points)`;
                };
                let matchData = `${replayStage}\n${replayResult}\n${replayTimestamp}`;
                // Player data
                let playerData = [];
                playerData.push(`Player: ${replayData.player.name}#${replayData.player.nameId} (${replayData.player.byname})`);
                playerData.push(`Weapon: ${replayData.player.weapon.name}`);
                playerData.push(`Head: ${replayData.player.headGear.name}`);
                playerData.push(`Clothing: ${replayData.player.clothingGear.name}`);
                playerData.push(`Shoes: ${replayData.player.shoesGear.name}`);
                if (replayIsTurfWar) playerData.push(`Points: ${replayData.myTeam.result.paintPoint}`);
                // Skills
                let headSkills = [`**${replayData.player.headGear.primaryGearPower.name}**`];
                replayData.player.headGear.additionalGearPowers.forEach(power => { headSkills.push(power.name) });
                let clothingSkills = [`**${replayData.player.clothingGear.primaryGearPower.name}**`];
                replayData.player.clothingGear.additionalGearPowers.forEach(power => { clothingSkills.push(power.name) });
                let shoesSkills = [`**${replayData.player.shoesGear.primaryGearPower.name}**`];
                replayData.player.shoesGear.additionalGearPowers.forEach(power => { shoesSkills.push(power.name) });
                // Awards
                let replayAwards = [];
                replayData.awards.forEach(award => { replayAwards.push(award.name) });

                splat3Embed
                    .setAuthor({ name: replayMode })
                    .setThumbnail(replayData.player.weapon.image.url)
                    .setDescription(matchData)
                    .addField("Player Data:", playerData.join("\n"), false)
                    .addField(`${replayData.player.headGear.name} Skills:`, headSkills.join("\n"), false)
                    .addField(`${replayData.player.clothingGear.name} Skills:`, clothingSkills.join("\n"), false)
                    .addField(`${replayData.player.shoesGear.name} Skills:`, shoesSkills.join("\n"), false);
                if (replayAwards.length > 0) splat3Embed.addField("Awards:", replayAwards.join("\n"), false);
                splat3Embed.setFooter({ text: `Replay ID: ${replayResponse.data.replay.replayCode}` });
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

                let bannerOptions = fs.readdirSync("submodules/leanny.github.io/splat3/images/npl/").filter(file => file.endsWith(".png"));
                let badgeOptions = fs.readdirSync("submodules/leanny.github.io/splat3/images/badge/").filter(file => file.endsWith(".png"));
                let bannerRandom = bannerOptions[randomNumber(0, bannerOptions.length - 1)];
                let badgeRandom = badgeOptions[randomNumber(0, badgeOptions.length - 1)];
                let badgeRandom2 = badgeOptions[randomNumber(0, badgeOptions.length - 1)];
                let badgeRandom3 = badgeOptions[randomNumber(0, badgeOptions.length - 1)];

                splat3Embed
                    .setAuthor({ name: randomTitle, iconURL: `${github}images/badge/${badgeRandom}?raw=true` })
                    .setTitle(userTitle)
                    .setThumbnail(`${github}images/badge/${badgeRandom2}?raw=true`)
                    .setImage(`${github}images/npl/${bannerRandom}?raw=true`)
                    .setFooter({ text: `#${interaction.user.discriminator}`, iconURL: `${github}images/badge/${badgeRandom3}?raw=true` });
                break;
        };
        return sendMessage({ client: client, interaction: interaction, embeds: splat3Embed });

        function getGearString(gear, type) {
            let limitedGearString = "";
            if (type == "limited") limitedGearString += `Sale ends <t:${Date.parse(gear.saleEndTime) / 1000}:R>.\n`;
            limitedGearString += `Ability: ${gear.gear.primaryGearPower.name}\n`;
            let limitedGearStars = star.repeat(gear.gear.additionalGearPowers.length - 1);
            let limitedGearStarString = `Slots: ${gear.gear.additionalGearPowers.length}`;
            if (gear.gear.additionalGearPowers.length > 1) limitedGearStarString += ` (${limitedGearStars})`;
            limitedGearString += `${limitedGearStarString}\n`;
            limitedGearString += `Brand: ${gear.gear.brand.name}\n`;
            limitedGearString += `Price: ${gear.price}\n`;
            return limitedGearString;
        };

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
        name: "splatnet",
        type: "SUB_COMMAND",
        description: "Get SplatNet3 data.",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "splatfests",
        type: "SUB_COMMAND",
        description: "Get all Splatfests data.",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "replay",
        type: "SUB_COMMAND",
        description: "Get a replay.",
        options: [{
            name: "code",
            type: "STRING",
            description: "Specify a replay code.",
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