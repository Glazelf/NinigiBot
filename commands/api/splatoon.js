import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    ApplicationIntegrationType,
    bold,
    time,
    TimestampStyles
} from "discord.js";
import fs from "fs";
import axios from "axios";
import sendMessage from "../../util/sendMessage.js";
import getSplatfests from "../../util/splat/getSplatfests.js";
import randomNumber from "../../util/math/randomNumber.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
const version = "latest"; // Use version number without periods or "latest"
import GearInfoClothesJSON from "../../submodules/splat3/data/mush/latest/GearInfoClothes.json" with { type: "json" };
import GearInfoHeadJSON from "../../submodules/splat3/data/mush/latest/GearInfoHead.json" with { type: "json" };
import GearInfoShoesJSON from "../../submodules/splat3/data/mush/latest/GearInfoShoes.json" with { type: "json" };
import WeaponInfoMainJSON from "../../submodules/splat3/data/mush/latest/WeaponInfoMain.json" with { type: "json" };
// import WeaponInfoSpecialJSON from "../../submodules/splat3/data/mush/latest/WeaponInfoSpecial.json" with { type: "json" };
// import WeaponInfoSubJSON from "../../submodules/splat3/data/mush/latest/WeaponInfoSub.json" with { type: "json" };

// Import language files
fs.readdir("./submodules/splat3/data/language/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(async (file) => {
        const fileName = file.split(".")[0];
        if (!fileName.endsWith("_full")) return; // Skip to next iteration, only count full language files
        const languageKey = fileName.split("_")[0];
        const languageJSON = await import(`../../submodules/splat3/data/language/${file}`, { assert: { type: "json" } });
        globalVars.splatoon3.languageJSONs[languageKey] = languageJSON.default;
    });
});

const splatoon3Languages = [
    { name: "English", value: "EUen" },
    { name: "French | Français", value: "EUfr" },
    { name: "German | Deutsch", value: "EUde" },
    { name: "Spanish | Español", value: "EUes" },
    { name: "Dutch | Nederlands", value: "EUnl" },
    { name: "Italian | Italiano", value: "EUit" },
    { name: "Russian | Русский", value: "EUru" },
    { name: "Japanese | 日本語", value: "JPja" },
    { name: "Korean | 한국어", value: "KRko" },
    { name: "Chinese (Simplified) | 中文（简体)", value: "CNzh" },
    { name: "Chinese (Traditional) | 中文（繁體)", value: "TWzh" }
];
const splatoon3Regions = [
    { value: "EU", name: "Europe" },
    { value: "US", name: "United States" },
    { value: "JP", name: "Japan" },
    { value: "AP", name: "Asia/Pacific" }
];

const star = "⭐";
const githubRaw = "https://raw.githubusercontent.com/Leanny/splat3/main/";
const schedulesAPI = "https://splatoon3.ink/data/schedules.json"; // Includes all schedules
const splatnetAPI = "https://splatoon3.ink/data/gear.json"; // SplatNet gear data
const salmonRunGearAPI = "https://splatoon3.ink/data/coop.json"; // Current Salmon Run gear reward
const splatfestAPI = "https://splatoon3.ink/data/festivals.json"; // All Splatfest results
const replayAPI = "https://splatoon3-replay-lookup.fancy.org.uk/api/splatnet3/replay/"; // Replay lookup
const replayLookupGithub = "https://github.com/samuelthomas2774/splatoon3-replay-lookup";

export default async (interaction, ephemeral) => {
    // Game data
    let versionLatest = version;
    if (versionLatest == "latest") versionLatest = await fs.promises.readlink("./submodules/splat3/data/mush/latest");
    let versionSplit = versionLatest.split("").join(".");
    if (versionSplit.startsWith("1.")) versionSplit = versionSplit.replace("1.", "1");
    let versionString = `Splatoon 3 v${versionSplit}`;

    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    // Check language
    let languageKey = interaction.options.getString("language");
    if (!languageKey) languageKey = "EUen";
    let languageJSON = globalVars.splatoon3.languageJSONs[languageKey];
    let inputID = interaction.options.getString("name");
    let inputRegion = interaction.options.getString("region");
    if (!inputRegion) inputRegion = "US"; // Change back to "EU" when Splatfests get fixed in the SplatNet API
    let weaponListTitle = `${languageJSON["LayoutMsg/Cmn_Menu_00"]["L_BtnMap_05-T_Text_00"]}:`;
    let splat3Embed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    switch (interaction.options.getSubcommand()) {
        case "clothing":
            // Get clothing type as added in events/interactionCreate.js
            let inputIDSplit = inputID.split("_");
            let clothingType = inputIDSplit[inputIDSplit.length - 1];
            inputIDSplit.pop(); // Remove added clothing type
            inputID = inputIDSplit.join("_"); // Restore original ID
            // let allClothesJSON = GearInfoHeadJSON.concat(GearInfoClothesJSON, GearInfoShoesJSON); // Using concat on objects because the JSON files are actually an array of unnamed objects despite being typed as object. Don't worry about it
            let clothingFailedString = `Couldn't find that piece of clothing. Make sure you select an autocomplete option.`;
            let selectedClothesJSON = null;
            switch (clothingType) {
                case "Head":
                    selectedClothesJSON = GearInfoHeadJSON;
                    break;
                case "Clothes":
                    selectedClothesJSON = GearInfoClothesJSON;
                    break;
                case "Shoes":
                    selectedClothesJSON = GearInfoShoesJSON;
                    break;
                default:
                    return sendMessage({ interaction: interaction, content: clothingFailedString });
            };
            let clothingObject = Object.values(selectedClothesJSON).find(clothing => clothing.__RowId.includes(inputID));
            if (!clothingObject) return sendMessage({ interaction: interaction, content: clothingFailedString });
            let clothingAuthor = languageJSON[`CommonMsg/Gear/GearName_${clothingType}`][`${inputID}_${clothingType}`]; // Possible to read .__RowId property instead of using clothingType
            if (!clothingAuthor) clothingAuthor = inputID;

            let starRating = star.repeat(clothingObject.Rarity);
            if (starRating.length > 0) clothingAuthor = `${clothingAuthor} (${starRating})`;
            // Obtainability
            let shopsTitle = languageJSON["LayoutMsg/Cmn_Menu_00"]["T_Shop_00"];
            let obtainMethod = clothingObject.HowToGet;
            if (obtainMethod == "Shop") obtainMethod = `${shopsTitle} (${clothingObject.Price})`;

            let abilityTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["001"]}:`;
            let brandTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["002"]}:`;
            let slotsTitle = `${languageJSON["LayoutMsg/Cmn_Menu_00"]["L_Player_02-T_BlackText_00"]}:`;
            let brandImage = `${githubRaw}images/brand/${clothingObject.Brand}.png`;
            let abilityImage = `${githubRaw}images/skill/${clothingObject.Skill}.png`;
            let clothingImage = `${githubRaw}images/gear/${clothingObject.__RowId}.png`;
            splat3Embed
                .setAuthor({ name: clothingAuthor, iconURL: brandImage })
                .setThumbnail(abilityImage)
                .setImage(clothingImage)
                .setFooter({ text: `${versionString} | *Main abilities can differ because of SplatNet or Murch.` })
                .addFields([
                    { name: abilityTitle, value: `${languageJSON["CommonMsg/Gear/GearPowerName"][clothingObject.Skill]}*`, inline: true },
                    { name: slotsTitle, value: (clothingObject.Rarity + 1).toString(), inline: true },
                    { name: brandTitle, value: languageJSON["CommonMsg/Gear/GearBrandName"][clothingObject.Brand], inline: true },
                    { name: "Obtain Method:", value: obtainMethod, inline: true }
                ]);
            break;
        case "weapon":
            let weaponObject = await Object.values(WeaponInfoMainJSON).find(weapon => weapon.GameActor.includes(inputID));
            if (!weaponObject) return sendMessage({ interaction: interaction, content: `Couldn't find that weapon. Make sure you select an autocomplete option.` });

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
            let specialPointsTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["L_DetailWpn_00-T_Special_00"]}`;
            if (!specialPointsTitle.endsWith(":")) specialPointsTitle += ":";
            weaponStats += `\n${specialPointsTitle} ${weaponObject.SpecialPoint}`;

            let subTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["004"]}:`;
            let specialTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["005"]}:`;
            let shopTitle = `${languageJSON["CommonMsg/Glossary"]["WeaponShop"]}:`;
            let infoTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["L_GuideBtn_01-T_Info_00"]}:`;
            let levelString = `${languageJSON["CommonMsg/UnitName"]["WeaponUnlockRank"]}`;
            if (levelString.includes("[")) levelString = levelString.split(" ")[0];
            let weaponUnlockString = `${levelString} ${weaponObject.ShopUnlockRank}+`.replace("-", "");
            let subImage = `${githubRaw}images/subspe/Wsb_${subID}00.png`;
            let specialImage = `${githubRaw}images/subspe/Wsp_${specialID}00.png`;
            let weaponImage = `${githubRaw}images/weapon/Wst_${inputID}.png`;
            splat3Embed
                .setAuthor({ name: weaponAuthor, iconURL: subImage })
                .setThumbnail(specialImage)
                .setImage(weaponImage)
                .setFooter({ text: versionString })
                .addFields([
                    { name: subTitle, value: languageJSON["CommonMsg/Weapon/WeaponName_Sub"][subID], inline: true },
                    { name: specialTitle, value: languageJSON["CommonMsg/Weapon/WeaponName_Special"][specialID], inline: true },
                    { name: shopTitle, value: weaponUnlockString, inline: true },
                    { name: infoTitle, value: weaponStats, inline: false }
                ]);
            break;
        case "subweapon":
            let subweaponMatches = Object.values(WeaponInfoMainJSON).filter(weapon => {
                let weaponSubID = weapon.SubWeapon.split("/");
                weaponSubID = weaponSubID[weaponSubID.length - 1].split(".")[0];
                if (weapon.__RowId.endsWith("_Coop") || weapon.__RowId.endsWith("_Msn") || weapon.__RowId.includes("_Rival") && weapon.__RowId.includes("_AMB_")) return false;
                if (inputID == weaponSubID) return true;
            });
            if (subweaponMatches.length < 1) return sendMessage({ interaction: interaction, content: `Couldn't find that subweapon. Make sure you select an autocomplete option.` });
            let allSubweaponMatchesNames = "";
            subweaponMatches.forEach(subweapon => {
                allSubweaponMatchesNames += `${languageJSON["CommonMsg/Weapon/WeaponName_Main"][subweapon.__RowId]}\n`;
            });
            let subThumbnail = `${githubRaw}images/subspe/Wsb_${inputID}00.png`;

            let subName = languageJSON["CommonMsg/Weapon/WeaponName_Sub"][inputID];
            let subDescription = languageJSON["CommonMsg/Weapon/WeaponExp_Sub"][inputID]
                .replace("\\n", " ")
                .replace(/\[group=0003 type=000a params=00 00 80 3f 00 00 00 00]/g, "`R`")
                .replace(/\[group=0003 type=0000 params=00 00 80 3f 00 00 00 00]/g, "`A`");
            splat3Embed
                .setTitle(subName)
                .setThumbnail(subThumbnail)
                .setDescription(subDescription)
                .setFooter({ text: versionString })
                .addFields([{ name: weaponListTitle, value: allSubweaponMatchesNames, inline: false }]);
            break;
        case "special":
            let specialWeaponMatches = Object.values(WeaponInfoMainJSON).filter(weapon => {
                let weaponSpecialID = weapon.SpecialWeapon.split("/");
                weaponSpecialID = weaponSpecialID[weaponSpecialID.length - 1].split(".")[0];
                if (weapon.__RowId.endsWith("_Coop") || weapon.__RowId.endsWith("_Msn") || weapon.__RowId.includes("_Rival") && weapon.__RowId.includes("_AMB_")) return false;
                if (inputID == weaponSpecialID) return true;
            });
            if (specialWeaponMatches.length < 1) return sendMessage({ interaction: interaction, content: `Couldn't find that special weapon. Make sure you select an autocomplete option.` });
            let allSpecialWeaponMatchesNames = "";
            specialWeaponMatches.forEach(specialWeaponEntry => {
                allSpecialWeaponMatchesNames += `${languageJSON["CommonMsg/Weapon/WeaponName_Main"][specialWeaponEntry.__RowId]} (${specialWeaponEntry.SpecialPoint}p)\n`;
            });
            let specialThumbnail = `${githubRaw}images/subspe/Wsp_${inputID}00.png`;

            let specialName = languageJSON["CommonMsg/Weapon/WeaponName_Special"][inputID];
            let specialDescription = languageJSON["CommonMsg/Weapon/WeaponExp_Special"][inputID]
                .replace("\\n", " ")
                .replace(/\[group=0003 type=000c params=00 00 80 3f 00 00 00 00]/g, "`ZR`").replace(/\[group=0003 type=000a params=00 00 80 3f 00 00 00 00]/g, "`R`").replace(/\[group=0003 type=000b params=00 00 80 3f 00 00 00 00]/g, "`ZL`").replace(/\[group=0003 type=0001 params=00 00 80 3f 00 00 00 00]/g, "`B`");
            splat3Embed
                .setTitle(specialName)
                .setThumbnail(specialThumbnail)
                .setDescription(specialDescription)
                .setFooter({ text: versionString })
                .addFields([{ name: weaponListTitle, value: allSpecialWeaponMatchesNames, inline: false }])
            break;
        case "schedule":
            await interaction.deferReply({ ephemeral: ephemeral });
            let inputData = interaction.options.getString("mode");
            let modeName = inputData.split("|")[0];
            let inputMode = inputData.split("|")[1];
            let submode = inputData.split("|")[2];
            let modeIndex = null;
            if (submode == "series") modeIndex = 0;
            if (submode == "open") modeIndex = 1;
            let responseSchedules = await axios.get(schedulesAPI);
            if (responseSchedules.status != 200) return sendMessage({ interaction: interaction, content: `Error occurred getting schedule data. Please try again later.` });
            let currentFest = responseSchedules.data.data.currentFest;

            let turfWarID = "regularSchedules";
            let anarchyID = "bankaraSchedules";
            let salmonRunID = "coopGroupingSchedule";
            let xBattleID = "xSchedules";
            let leagueBattleID = "leagueSchedules";
            let splatfestBattleID = "festSchedules";
            let challengesID = "eventSchedules";
            let allowedModes = [];
            allowedModes.push(salmonRunID);
            if (currentFest) {
                allowedModes.push(splatfestBattleID);
            } else {
                allowedModes.push(turfWarID, anarchyID, xBattleID, leagueBattleID);
            };
            if (responseSchedules.data.data.eventSchedules.nodes.length > 0) allowedModes.push(challengesID);
            if (!allowedModes.includes(inputMode)) return sendMessage({ interaction: interaction, content: `That mode either does not exist or is not currently available ingame.` });

            let scheduleData = responseSchedules.data.data[inputMode];
            let currentSalmonRunEvent = null;
            let currentSalmonRunEventTitle = null;
            if (inputMode == salmonRunID) {
                scheduleData = scheduleData.regularSchedules;
                let currentBigRun = responseSchedules.data.data[inputMode].bigRunSchedules.nodes[0];
                let currentEggstraWork = responseSchedules.data.data[inputMode].teamContestSchedules.nodes[0];
                if (currentBigRun) {
                    currentSalmonRunEventTitle = `⚠️ ${bold("Big Run")} ⚠️`;
                    currentSalmonRunEvent = currentBigRun;
                };
                if (currentEggstraWork) {
                    currentSalmonRunEventTitle = `🥚 ${bold("Eggstra Work")} 🥚`;
                    currentSalmonRunEvent = currentEggstraWork;
                };
            };
            let scheduleMode = inputMode.split("Schedule")[0];

            let currentTime = new Date().valueOf();
            let currentMaps = null;
            let upcomingMaps = null;
            if (!currentSalmonRunEvent) currentMaps = scheduleData.nodes.find(entry => Date.parse(entry.startTime) < currentTime);
            upcomingMaps = scheduleData.nodes.find(entry => entry !== currentMaps && Date.parse(entry.startTime) < currentTime + (2 * 60 * 60 * 1000)); // Add 2 hours to current time

            let randomStageIndex = randomNumber(0, 1);
            let modeSettings = `${scheduleMode}MatchSetting`;
            if (currentMaps && !currentMaps[`${scheduleMode}MatchSetting`]) modeSettings = `${scheduleMode}MatchSettings`;
            let entrySettings = null;
            if (currentMaps) entrySettings = currentMaps[modeSettings];
            if (inputMode == anarchyID) entrySettings = entrySettings[modeIndex];
            let currentMapsSettings = entrySettings;

            splat3Embed.setTitle(modeName);
            if (inputMode == salmonRunID) {
                // Salmon Run
                let responseSalmonRunGear = await axios.get(salmonRunGearAPI);
                if (responseSalmonRunGear.status == 200) {
                    splat3Embed
                        .setDescription(`Monthly Gear: ${responseSalmonRunGear.data.data.coopResult.monthlyGear.name}`)
                        .setThumbnail(responseSalmonRunGear.data.data.coopResult.monthlyGear.image.url);
                };
                if (currentSalmonRunEvent) {
                    let eventWeaponString = "";
                    await currentSalmonRunEvent.setting.weapons.forEach(weapon => {
                        eventWeaponString += `- ${weapon.name}\n`;
                    });
                    splat3Embed.setDescription(`${currentSalmonRunEventTitle}\nStart: ${time(Date.parse(currentSalmonRunEvent.startTime) / 1000, TimestampStyles.ShortDateTime)}\nEnd: ${time(Date.parse(currentSalmonRunEvent.endTime) / 1000, TimestampStyles.ShortDateTime)}\nMap: ${bold(currentSalmonRunEvent.setting.coopStage.name)}\nWeapons:\n${eventWeaponString}`);
                };
                await scheduleData.nodes.forEach(async (entry) => {
                    let salmonRotationTime = time(Date.parse(entry.startTime) / 1000, TimestampStyles.ShortDateTime);
                    let weaponString = "";
                    await entry.setting.weapons.forEach(weapon => {
                        weaponString += `- ${weapon.name}\n`;
                    });
                    splat3Embed.addFields([{ name: `${salmonRotationTime}\n${entry.setting.coopStage.name}`, value: `${entry.__splatoon3ink_king_salmonid_guess}\n${weaponString}`, inline: true }]);
                });
                if (currentSalmonRunEvent && Date.now() >= Date.parse(currentSalmonRunEvent.startTime)) {
                    splat3Embed.setImage(currentSalmonRunEvent.setting.coopStage.image.url);
                } else {
                    splat3Embed
                        .setImage(currentMaps.setting.coopStage.thumbnailImage.url)
                        .setFooter({ text: `Image is from ${currentMaps.setting.coopStage.name}.` });
                };
            } else if (inputMode == splatfestBattleID) {
                // Splatfest
                let splatfestScheduleDescription = `${currentFest.title}\n`;
                let responseSplatfest = await axios.get(splatfestAPI);
                let splatfestData = responseSplatfest.data[inputRegion].data.festRecords.nodes.find(fest => fest.startTime == currentFest.startTime);
                let splatfestDefender = null;
                let splatfestTeamIndex = 0;
                await splatfestData.teams.forEach(team => {
                    if (splatfestTeamIndex !== 0) splatfestScheduleDescription += " vs. ";
                    splatfestTeamIndex++;
                    splatfestScheduleDescription += team.teamName;
                    if (team.role == "DEFENSE") splatfestDefender = team.teamName;
                });
                splatfestScheduleDescription += `\nDuration: ${time(Date.parse(currentFest.startTime) / 1000, TimestampStyles.ShortDateTime)}-${time(Date.parse(currentFest.endTime) / 1000, TimestampStyles.ShortDateTime)}`;
                let tricolorSchedule = `${time(Date.parse(currentFest.midtermTime) / 1000, TimestampStyles.ShortDateTime)}-${time(Date.parse(currentFest.endTime) / 1000, TimestampStyles.ShortDateTime)}`;
                if (splatfestDefender) tricolorSchedule += `\nDefense: Team ${splatfestDefender}`;
                tricolorSchedule += `\n${currentFest.tricolorStage.name}`;
                splat3Embed
                    .setDescription(splatfestScheduleDescription)
                    .setImage(splatfestData.image.url)
                    .addFields([{ name: "Tricolor Battle:", value: tricolorSchedule, inline: false }]);
            };
            if ([turfWarID, anarchyID, splatfestBattleID, xBattleID].includes(inputMode)) {
                // Turf War, Anarchy, xBattle and SplatfestTW
                await scheduleData.nodes.forEach(entry => {
                    entrySettings = entry[modeSettings];
                    let mapEntryTimes = `${time(Date.parse(entry.startTime) / 1000, TimestampStyles.ShortTime)}-${time(Date.parse(entry.endTime) / 1000, TimestampStyles.ShortTime)}`;
                    let mapEntryTitle = mapEntryTimes;
                    if (inputMode == anarchyID) {
                        entrySettings = entrySettings[modeIndex];
                        mapEntryTitle += `\n${entrySettings.vsRule.name}`;
                    };
                    if (!entrySettings) return;
                    let entryMaps = `${entrySettings.vsStages[0].name}\n${entrySettings.vsStages[1].name}`;
                    splat3Embed.addFields([{ name: mapEntryTitle, value: entryMaps, inline: true }]);
                });
                if ([turfWarID, anarchyID, xBattleID].includes(inputMode)) {
                    splat3Embed
                        .setImage(currentMapsSettings.vsStages[randomStageIndex].image.url)
                        .setFooter({ text: `Image is from ${currentMapsSettings.vsStages[randomStageIndex].name}.` });
                };
            } else if (inputMode == challengesID) (
                await scheduleData.nodes.forEach(async (entry) => {
                    let challengeName = entry.leagueMatchSetting.leagueMatchEvent.name;
                    let challengeDesc = entry.leagueMatchSetting.leagueMatchEvent.desc;
                    let challengeDescLong = entry.leagueMatchSetting.leagueMatchEvent.regulation.replace(/<br \/>/g, "").replace(/・/g, "\n- ");
                    let challengeMode = entry.leagueMatchSetting.vsRule.name;
                    let challengeMaps = `${entry.leagueMatchSetting.vsStages[0].name}, ${entry.leagueMatchSetting.vsStages[1].name}`;
                    let challengeTimes = "";
                    await entry.timePeriods.forEach(challengeTimePeriod => {
                        challengeTimes += `- ${time(Date.parse(challengeTimePeriod.startTime) / 1000, TimestampStyles.ShortDateTime)}-${time(Date.parse(challengeTimePeriod.endTime) / 1000, TimestampStyles.ShortTime)}\n`;
                    });
                    splat3Embed.addFields([{ name: challengeName, value: `${bold(challengeDesc)}\n${challengeDescLong}\n${bold("Mode:")} ${challengeMode}\n${bold("Maps:")} ${challengeMaps}\n${bold("Times:")}\n${challengeTimes}`, inline: false }]);
                })
            );
            break;
        case "splatnet":
            await interaction.deferReply({ ephemeral: ephemeral });
            let responseSplatnet = await axios.get(splatnetAPI);
            if (responseSplatnet.status != 200) return sendMessage({ interaction: interaction, content: `Error occurred getting SplatNet3 data. Please try again later.` });
            let splatnetData = responseSplatnet.data.data.gesotown;
            // Limited time brand
            splat3Embed
                .setTitle("SplatNet3 Shop")
                .setImage(splatnetData.pickupBrand.image.url)
                .setFooter({ text: `${splatnetData.pickupBrand.brand.name} promotional image.` })
                .addFields([{ name: `Daily Drop (${splatnetData.pickupBrand.brand.name})`, value: `${splatnetData.pickupBrand.brand.name} Common Ability: ${splatnetData.pickupBrand.brand.usualGearPower.name}\nDaily Drop (${splatnetData.pickupBrand.nextBrand.name}) starts ${time(Date.parse(splatnetData.pickupBrand.saleEndTime) / 1000, TimestampStyles.RelativeTime)}.`, inline: false }]);
            await splatnetData.pickupBrand.brandGears.forEach(brandGear => {
                let brandGearString = getGearString(brandGear, "brand");
                splat3Embed.addFields([{ name: brandGear.gear.name, value: brandGearString, inline: true }]);
            });
            // Individual gear pieces
            splat3Embed.addFields([{ name: "Gear On Sale Now", value: `New item ${time(Date.parse(splatnetData.limitedGears[0].saleEndTime) / 1000, TimestampStyles.RelativeTime)}.`, inline: false }]);
            await splatnetData.limitedGears.forEach(limitedGear => {
                let limitedGearString = getGearString(limitedGear, "limited");
                splat3Embed.addFields([{ name: limitedGear.gear.name, value: limitedGearString, inline: true }]);
            });
            break;
        case "splatfests":
            await interaction.deferReply({ ephemeral: ephemeral });
            let splatfestReplyObject = await getSplatfests({ page: 1, region: inputRegion });
            return sendMessage({ interaction: interaction, content: splatfestReplyObject.content, embeds: splatfestReplyObject.embeds, components: splatfestReplyObject.components, ephemeral: ephemeral });
        case "replay":
            await interaction.deferReply({ ephemeral: ephemeral });
            let replayCode = interaction.options.getString("code");
            replayCode = replayCode.toUpperCase().replace(/-/g, ""); // Remove dashes for consistency
            // User-Agent for identification, can be added as a default under axios.defaults.headers.common["User-Agent"] if other tools require this. Replay Lookup blocks generic axios requests
            let replayResponse = await axios.get(`${replayAPI}${replayCode}`, { headers: { "User-Agent": "NinigiBot (+https://github.com/Glazelf/NinigiBot" } });
            if (replayResponse.status !== 200) return interaction.reply({ content: "Error occurred getting that replay. Make sure the code is correct." });
            let replayData = replayResponse.data.replay.historyDetail;
            let replayIsTurfWar = replayData.vsRule.name == "Turf War";
            // Match data
            let replayTimestamp = `Timestamp: ${time(Date.parse(replayData.playedTime) / 1000, TimestampStyles.ShortDateTime)}`;
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
            let headSkills = [bold(replayData.player.headGear.primaryGearPower.name)];
            replayData.player.headGear.additionalGearPowers.forEach(power => { headSkills.push(power.name) });
            let clothingSkills = [bold(replayData.player.clothingGear.primaryGearPower.name)];
            replayData.player.clothingGear.additionalGearPowers.forEach(power => { clothingSkills.push(power.name) });
            let shoesSkills = [bold(replayData.player.shoesGear.primaryGearPower.name)];
            replayData.player.shoesGear.additionalGearPowers.forEach(power => { shoesSkills.push(power.name) });
            // Awards
            let replayAwards = [];
            replayData.awards.forEach(award => { replayAwards.push(award.name) });

            splat3Embed
                .setTitle(replayMode)
                .setThumbnail(replayData.player.weapon.image.url)
                .setDescription(matchData)
                // Replace() is to add dashes for consistency with in-game GUI, slice is to remove final -
                .setFooter({ text: `Replay ID: ${replayResponse.data.replay.replayCode.replace(/(.{4})/g, "$1-").slice(0, -1)}\nAPI: ${replayLookupGithub}` })
                .addFields([
                    { name: "Player Data:", value: playerData.join("\n"), inline: false },
                    { name: `${replayData.player.headGear.name} Skills:`, value: headSkills.join("\n"), inline: true },
                    { name: `${replayData.player.clothingGear.name} Skills:`, value: clothingSkills.join("\n"), inline: true },
                    { name: `${replayData.player.shoesGear.name} Skills:`, value: shoesSkills.join("\n"), inline: true }
                ]);
            if (replayAwards.length > 0) splat3Embed.addFields([{ name: "Awards:", value: replayAwards.join("\n"), inline: false }]);
            break;
        case "splashtag-random":
            let userTitle = interaction.user.displayName;
            if (interaction.inGuild() && Object.keys(interaction.authorizingIntegrationOwners).includes(ApplicationIntegrationType.GuildInstall.toString())) userTitle = interaction.member.displayName;

            let adjectives = Object.values(languageJSON["CommonMsg/Byname/BynameAdjective"]).filter(adjective => !adjective.includes("[") && adjective !== "");
            let randomAdjective = adjectives[randomNumber(0, adjectives.length - 1)];
            let subjects = Object.values(languageJSON["CommonMsg/Byname/BynameSubject"]).filter(subject => !subject.includes("[") && subject !== "");
            let randomSubject = subjects[randomNumber(0, subjects.length - 1)];

            let reversedLanguages = ["EUfr", "EUes", "EUit"];
            let randomTitle = `${randomAdjective} ${randomSubject}`;
            if (reversedLanguages.includes(languageKey)) randomTitle = `${randomSubject} ${randomAdjective}`;

            let bannerOptions = fs.readdirSync("submodules/splat3/images/npl/").filter(file => file.endsWith(".png"));
            let badgeOptions = fs.readdirSync("submodules/splat3/images/badge/").filter(file => file.endsWith(".png"));
            let bannerRandom = bannerOptions[randomNumber(0, bannerOptions.length - 1)];
            let badgeRandom = badgeOptions[randomNumber(0, badgeOptions.length - 1)];
            let badgeRandom2 = badgeOptions[randomNumber(0, badgeOptions.length - 1)];
            let badgeRandom3 = badgeOptions[randomNumber(0, badgeOptions.length - 1)];
            let discriminatorRandom = randomNumber(1000, 9999);
            splat3Embed
                .setAuthor({ name: randomTitle, iconURL: `${githubRaw}images/badge/${badgeRandom}` })
                .setTitle(userTitle)
                .setThumbnail(`${githubRaw}images/badge/${badgeRandom2}`)
                .setImage(`${githubRaw}images/npl/${bannerRandom}`)
                .setFooter({ text: discriminatorRandom.toString(), iconURL: `${githubRaw}images/badge/${badgeRandom3}` });
            break;
    };
    return sendMessage({ interaction: interaction, embeds: splat3Embed, ephemeral: ephemeral });
};

function getGearString(gear, type) {
    let limitedGearString = "";
    if (type == "limited") limitedGearString += `Sale ends ${time(Date.parse(gear.saleEndTime) / 1000, TimestampStyles.RelativeTime)}.\n`;
    limitedGearString += `Ability: ${gear.gear.primaryGearPower.name}\n`;
    let limitedGearStars = star.repeat(gear.gear.additionalGearPowers.length - 1);
    let limitedGearStarString = `Slots: ${gear.gear.additionalGearPowers.length}`;
    if (gear.gear.additionalGearPowers.length > 1) limitedGearStarString += ` (${limitedGearStars})`;
    limitedGearString += `${limitedGearStarString}\n`;
    limitedGearString += `Brand: ${gear.gear.brand.name}\n`;
    limitedGearString += `Price: ${gear.price}\n`;
    return limitedGearString;
};

// String options
const clothingOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Specify a piece of clothing by name.")
    .setAutocomplete(true)
    .setRequired(true);
const weaponOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Specify a weapon by name.")
    .setAutocomplete(true)
    .setRequired(true);
const subweaponOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Specify a subweapon by name.")
    .setAutocomplete(true)
    .setRequired(true);
const specialOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Specify a special weapon by name.")
    .setAutocomplete(true)
    .setRequired(true);
const modeOption = new SlashCommandStringOption()
    .setName("mode")
    .setDescription("Specify a mode")
    .setAutocomplete(true)
    .setRequired(true);
const languageOption = new SlashCommandStringOption()
    .setName("language")
    .setDescription("Specify a language")
    .setChoices(splatoon3Languages);
const regionOption = new SlashCommandStringOption()
    .setName("region")
    .setDescription("Specify a region. Default is EU.")
    .setChoices(splatoon3Regions);
const replayCodeOption = new SlashCommandStringOption()
    .setName("code")
    .setDescription("Specify a replay by code.")
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const clothingSubcommand = new SlashCommandSubcommandBuilder()
    .setName("clothing")
    .setDescription("Get info on a piece of clothing.")
    .addStringOption(clothingOption)
    .addStringOption(languageOption)
    .addBooleanOption(ephemeralOption);
const weaponSubcommand = new SlashCommandSubcommandBuilder()
    .setName("weapon")
    .setDescription("Get info on a weapon.")
    .addStringOption(weaponOption)
    .addStringOption(languageOption)
    .addBooleanOption(ephemeralOption);
const subweaponSubcommand = new SlashCommandSubcommandBuilder()
    .setName("subweapon")
    .setDescription("Get info on a subweapon")
    .addStringOption(subweaponOption)
    .addStringOption(languageOption)
    .addBooleanOption(ephemeralOption);
const specialSubcommand = new SlashCommandSubcommandBuilder()
    .setName("special")
    .setDescription("Get info on a special weapon.")
    .addStringOption(specialOption)
    .addStringOption(languageOption)
    .addBooleanOption(ephemeralOption);
const scheduleSubcommand = new SlashCommandSubcommandBuilder()
    .setName("schedule")
    .setDescription("Get the schedule of a mode.")
    .addStringOption(modeOption)
    .addStringOption(regionOption)
    .addBooleanOption(ephemeralOption);
const splatnetSubcommand = new SlashCommandSubcommandBuilder()
    .setName("splatnet")
    .setDescription("Get SplatNet3 data.")
    .addBooleanOption(ephemeralOption);
const splatfestsSubcommand = new SlashCommandSubcommandBuilder()
    .setName("splatfests")
    .setDescription("Get Splatfest data.")
    .addStringOption(regionOption)
    .addBooleanOption(ephemeralOption);
const replaySubcommand = new SlashCommandSubcommandBuilder()
    .setName("replay")
    .setDescription("Get info on a replay.")
    .addStringOption(replayCodeOption)
    .addBooleanOption(ephemeralOption);
const splashtagRandomSubcommand = new SlashCommandSubcommandBuilder()
    .setName("splashtag-random")
    .setDescription("Generate a random splashtag.")
    .addStringOption(languageOption)
    .addBooleanOption(ephemeralOption);
// Subcommand groups
const splat3SubcommandGroup = new SlashCommandSubcommandGroupBuilder()
    .setName("3")
    .setDescription("Splatoon 3.")
    .addSubcommand(clothingSubcommand)
    .addSubcommand(weaponSubcommand)
    .addSubcommand(subweaponSubcommand)
    .addSubcommand(specialSubcommand)
    .addSubcommand(scheduleSubcommand)
    .addSubcommand(splatnetSubcommand)
    .addSubcommand(splatfestsSubcommand)
    .addSubcommand(replaySubcommand)
    .addSubcommand(splashtagRandomSubcommand);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("splatoon")
    .setDescription("Shows Splatoon data.")
    .addSubcommandGroup(splat3SubcommandGroup);
