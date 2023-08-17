exports.run = async (client, interaction) => {
  const logger = require("../../util/logger");
  // Import globals
  let globalVars = require("../../events/ready");
  try {
    const sendMessage = require("../../util/sendMessage");
    const Discord = require("discord.js");
    const fs = require("fs");
    const path = require("path");
    const axios = require("axios");
    const randomNumber = require("../../util/randomNumber");
    // Game data
    let version = "4.0.0";
    let versionJoined = version.split(".").join("");
    let versionString = `Splatoon 3 v${version}`;
    const GearInfoClothesJSON = require(`../../submodules/splat3/data/mush/${versionJoined}/GearInfoClothes.json`);
    const GearInfoHeadJSON = require(`../../submodules/splat3/data/mush/${versionJoined}/GearInfoHead.json`);
    const GearInfoShoesJSON = require(`../../submodules/splat3/data/mush/${versionJoined}/GearInfoShoes.json`);
    const WeaponInfoMainJSON = require(`../../submodules/splat3/data/mush/${versionJoined}/WeaponInfoMain.json`);
    const WeaponInfoSpecialJSON = require(`../../submodules/splat3/data/mush/${versionJoined}/WeaponInfoSpecial.json`);
    const WeaponInfoSubJSON = require(`../../submodules/splat3/data/mush/${versionJoined}/WeaponInfoSub.json`);

    let ephemeral = interaction.options.getBoolean("ephemeral");
    if (ephemeral === null) ephemeral = true;
    let languageKey = interaction.options.getString("language");
    if (!languageKey) languageKey = "EUen";
    let languageJSON = require(`../../submodules/splat3/data/language/${languageKey}_full.json`);
    let inputID;
    let responseSplatfest;
    let splatfestData;
    let inputRegion = interaction.options.getString("region");
    if (!inputRegion) inputRegion = "EU";
    let splatfestTeamIndex = 0;
    let star = "⭐";
    let githubRaw = `https://raw.githubusercontent.com/Leanny/splat3/main/`;
    let schedulesAPI = `https://splatoon3.ink/data/schedules.json`; // Includes all schedules.
    let splatnetAPI = `https://splatoon3.ink/data/gear.json`; // SplatNet gear data.
    let salmonRunGearAPI = `https://splatoon3.ink/data/coop.json`; // Current Salmon Run gear reward.
    let splatfestAPI = `https://splatoon3.ink/data/festivals.json`; // All Splatfest results.
    let replayAPI = `https://splatoon3-replay-lookup.fancy.org.uk/api/splatnet3/replay/`; // Replay lookup.
    let weaponListTitle = `${languageJSON["LayoutMsg/Cmn_Menu_00"]["L_BtnMap_05-T_Text_00"]}:`;
    let splat3Embed = new Discord.MessageEmbed().setColor(
      globalVars.embedColor,
    );
    switch (interaction.options.getSubcommand()) {
      case "clothing":
        inputID = interaction.options.getString("clothing");
        let allClothesJSON = GearInfoHeadJSON.concat(
          GearInfoClothesJSON,
          GearInfoShoesJSON,
        ); // Using concat on objects because the JSON files are actually an array of unnamed objects despite being typed as object. Don't worry about it.
        // Doesn't always find the correct item despite its existence
        let clothingObject = await Object.values(allClothesJSON).find(
          (clothing) => clothing.__RowId.includes(inputID),
        );
        if (!clothingObject)
          return sendMessage({
            client: client,
            interaction: interaction,
            content: `Couldn't find that piece of clothing. Make sure you select an autocomplete option.`,
          });
        let clothingAuthor =
          languageJSON["CommonMsg/Gear/GearName_Clothes"][inputID];
        if (clothingObject.__RowId.startsWith("Shs"))
          clothingAuthor =
            languageJSON["CommonMsg/Gear/GearName_Shoes"][inputID];
        if (clothingObject.__RowId.startsWith("Hed"))
          clothingAuthor =
            languageJSON["CommonMsg/Gear/GearName_Head"][inputID];
        if (!clothingAuthor) clothingAuthor = inputID;
        let starRating = star.repeat(clothingObject.Rarity);
        if (starRating.length > 0)
          clothingAuthor = `${clothingAuthor} (${starRating})`;
        // Obtainability
        let shopsTitle = languageJSON["LayoutMsg/Cmn_Menu_00"]["T_Shop_00"];
        let ObtainMethod = clothingObject.HowToGet;
        if (ObtainMethod == "Shop")
          ObtainMethod = `${shopsTitle} (${clothingObject.Price})`;

        let abilityTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["001"]}:`;
        let brandTitle = `${languageJSON["LayoutMsg/Cmn_CstBase_00"]["002"]}:`;
        let slotsTitle = `${languageJSON["LayoutMsg/Cmn_Menu_00"]["L_Player_02-T_BlackText_00"]}:`;
        let brandImage = `${githubRaw}images/brand/${clothingObject.Brand}.png`;
        let abilityImage = `${githubRaw}images/skill/${clothingObject.Skill}.png`;
        let clothingImage = `${githubRaw}images/gear/${clothingObject.__RowId}.png`;

        splat3Embed
          .setAuthor({ name: clothingAuthor, iconURL: brandImage })
          .setThumbnail(abilityImage)
          .addField(
            abilityTitle,
            `${
              languageJSON["CommonMsg/Gear/GearPowerName"][clothingObject.Skill]
            }*`,
            true,
          )
          .addField(slotsTitle, (clothingObject.Rarity + 1).toString(), true)
          .addField(
            brandTitle,
            languageJSON["CommonMsg/Gear/GearBrandName"][clothingObject.Brand],
            true,
          )
          .addField("Obtain Method:", ObtainMethod, true)
          .setImage(clothingImage)
          .setFooter({
            text: `${versionString} | *Main abilities can differ because of SplatNet or Murch.`,
          });
        break;
      case "weapon":
        inputID = interaction.options.getString("weapon");
        let weaponObject = await Object.values(WeaponInfoMainJSON).find(
          (weapon) => weapon.GameActor.includes(inputID),
        );
        if (!weaponObject)
          return sendMessage({
            client: client,
            interaction: interaction,
            content: `Couldn't find that weapon. Make sure you select an autocomplete option.`,
          });

        let weaponAuthor =
          languageJSON["CommonMsg/Weapon/WeaponName_Main"][inputID];
        if (!weaponAuthor) weaponAuthor = inputID;
        let weaponStats = "";
        let specialID = weaponObject.SpecialWeapon.split("/");
        specialID = specialID[specialID.length - 1].split(".")[0];
        let subID = weaponObject.SubWeapon.split("/");
        subID = subID[subID.length - 1].split(".")[0];

        await weaponObject.UIParam.forEach((stat) => {
          weaponStats += `\n${
            languageJSON["CommonMsg/Weapon/WeaponParamName"][stat.Type]
          }: ${stat.Value}/100`;
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
        let subImage = `${githubRaw}images/subspe/Wsb_${subID}00.png`;
        let specialImage = `${githubRaw}images/subspe/Wsp_${specialID}00.png`;
        let weaponImage = `${githubRaw}images/weapon/Wst_${inputID}.png`;
        splat3Embed
          .setAuthor({ name: weaponAuthor, iconURL: subImage })
          .setThumbnail(specialImage)
          .addField(
            subTitle,
            languageJSON["CommonMsg/Weapon/WeaponName_Sub"][subID],
            true,
          )
          .addField(
            specialTitle,
            languageJSON["CommonMsg/Weapon/WeaponName_Special"][specialID],
            true,
          )
          .addField(
            shopTitle,
            `${levelString} ${weaponObject.ShopUnlockRank}+`,
            true,
          )
          .addField(infoTitle, weaponStats, false)
          .setImage(weaponImage)
          .setFooter({ text: versionString });
        break;
      case "subweapon":
        inputID = interaction.options.getString("subweapon");
        let subweaponMatches = await Object.values(WeaponInfoMainJSON).filter(
          (weapon) => {
            let weaponSubID = weapon.SubWeapon.split("/");
            weaponSubID = weaponSubID[weaponSubID.length - 1].split(".")[0];
            if (
              weapon.__RowId.endsWith("_Coop") ||
              weapon.__RowId.endsWith("_Msn") ||
              (weapon.__RowId.includes("_Rival") &&
                weapon.__RowId.includes("_AMB_"))
            )
              return false;
            if (inputID == weaponSubID) return true;
          },
        );
        if (subweaponMatches.length < 1)
          return sendMessage({
            client: client,
            interaction: interaction,
            content: `Couldn't find that subweapon. Make sure you select an autocomplete option.`,
          });
        let allSubweaponMatchesNames = "";
        subweaponMatches.forEach((subweapon) => {
          allSubweaponMatchesNames += `${
            languageJSON["CommonMsg/Weapon/WeaponName_Main"][subweapon.__RowId]
          }\n`;
        });
        let subThumbnail = `${githubRaw}images/subspe/Wsb_${inputID}00.png`;

        let subName = languageJSON["CommonMsg/Weapon/WeaponName_Sub"][inputID];
        let subDescription = languageJSON["CommonMsg/Weapon/WeaponExp_Sub"][
          inputID
        ]
          .replace("\\n", " ")
          .replace(
            "[group=0003 type=000a params=00 00 80 3f 00 00 00 00]",
            "**R**",
          );
        splat3Embed
          .setAuthor({ name: subName })
          .setThumbnail(subThumbnail)
          .setDescription(subDescription)
          .addField(weaponListTitle, allSubweaponMatchesNames, false)
          .setFooter({ text: versionString });
        break;
      case "special":
        inputID = interaction.options.getString("special");
        let specialWeaponMatches = await Object.values(
          WeaponInfoMainJSON,
        ).filter((weapon) => {
          let weaponSpecialID = weapon.SpecialWeapon.split("/");
          weaponSpecialID =
            weaponSpecialID[weaponSpecialID.length - 1].split(".")[0];
          if (
            weapon.__RowId.endsWith("_Coop") ||
            weapon.__RowId.endsWith("_Msn") ||
            (weapon.__RowId.includes("_Rival") &&
              weapon.__RowId.includes("_AMB_"))
          )
            return false;
          if (inputID == weaponSpecialID) return true;
        });
        if (specialWeaponMatches.length < 1)
          return sendMessage({
            client: client,
            interaction: interaction,
            content: `Couldn't find that special weapon. Make sure you select an autocomplete option.`,
          });
        let allSpecialWeaponMatchesNames = "";
        specialWeaponMatches.forEach((specialweapon) => {
          allSpecialWeaponMatchesNames += `${
            languageJSON["CommonMsg/Weapon/WeaponName_Main"][
              specialweapon.__RowId
            ]
          }\n`;
        });
        let specialThumbnail = `${githubRaw}images/subspe/Wsp_${inputID}00.png`;

        let specialName =
          languageJSON["CommonMsg/Weapon/WeaponName_Special"][inputID];
        let specialDescription = languageJSON[
          "CommonMsg/Weapon/WeaponExp_Special"
        ][inputID]
          .replace("\\n", " ")
          .replaceAll(
            "[group=0003 type=000c params=00 00 80 3f 00 00 00 00]",
            "**ZR**",
          )
          .replaceAll(
            "[group=0003 type=000a params=00 00 80 3f 00 00 00 00]",
            "**R**",
          )
          .replaceAll(
            "[group=0003 type=000b params=00 00 80 3f 00 00 00 00]",
            "**ZL**",
          )
          .replaceAll(
            "[group=0003 type=0001 params=00 00 80 3f 00 00 00 00]",
            "**B**",
          );
        splat3Embed
          .setAuthor({ name: specialName })
          .setThumbnail(specialThumbnail)
          .setDescription(specialDescription)
          .addField(weaponListTitle, allSpecialWeaponMatchesNames, false)
          .setFooter({ text: versionString });
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
        if (responseSchedules.status != 200)
          return sendMessage({
            client: client,
            interaction: interaction,
            content: `Error occurred getting schedule data. Please try again later.`,
          });
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
          allowedModes.push(turfWarID, anarchyID, xBattleID); // leagueBattleID when it becomes available
        }
        if (responseSchedules.data.data.eventSchedules.nodes.length > 0)
          allowedModes.push(challengesID);
        if (!allowedModes.includes(inputMode))
          return sendMessage({
            client: client,
            interaction: interaction,
            content: `That mode either does not exist or is not currently available ingame.`,
          });

        let scheduleData = responseSchedules.data.data[inputMode];
        let currentSalmonRunEvent = null;
        let currentSalmonRunEventTitle = null;
        if (inputMode == salmonRunID) {
          scheduleData = scheduleData.regularSchedules;
          let currentBigRun =
            responseSchedules.data.data[inputMode].bigRunSchedules.nodes[0];
          let currentEggstraWork =
            responseSchedules.data.data[inputMode].teamContestSchedules
              .nodes[0];
          if (currentBigRun) {
            currentSalmonRunEventTitle = "⚠️ Big Run ⚠️";
            currentSalmonRunEvent = currentBigRun;
          }
          if (currentEggstraWork) {
            currentSalmonRunEventTitle = "🥚 Eggstra Work 🥚";
            currentSalmonRunEvent = currentEggstraWork;
          }
        }
        let scheduleMode = inputMode.split("Schedule")[0];

        let currentTime = new Date().valueOf();
        let currentMaps = null;
        let upcomingMaps = null;
        if (!currentSalmonRunEvent)
          currentMaps = scheduleData.nodes.find(
            (entry) => Date.parse(entry.startTime) < currentTime,
          );
        upcomingMaps = scheduleData.nodes.find(
          (entry) =>
            entry !== currentMaps &&
            Date.parse(entry.startTime) < currentTime + 2 * 60 * 60 * 1000,
        ); // Add 2 hours to current time

        let randomStageIndex = randomNumber(0, 1);
        let modeSettings = `${scheduleMode}MatchSetting`;
        if (currentMaps && !currentMaps[`${scheduleMode}MatchSetting`])
          modeSettings = `${scheduleMode}MatchSettings`;
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
              .setDescription(
                `Monthly Gear: ${responseSalmonRunGear.data.data.coopResult.monthlyGear.name}`,
              )
              .setThumbnail(
                responseSalmonRunGear.data.data.coopResult.monthlyGear.image
                  .url,
              );
          }
          if (currentSalmonRunEvent) {
            let eventWeaponString = "";
            await currentSalmonRunEvent.setting.weapons.forEach((weapon) => {
              eventWeaponString += `- ${weapon.name}\n`;
            });
            splat3Embed.setDescription(
              `${currentSalmonRunEventTitle}\nStart: <t:${
                Date.parse(currentSalmonRunEvent.startTime) / 1000
              }:f>\nEnd: <t:${
                Date.parse(currentSalmonRunEvent.endTime) / 1000
              }:f>\nMap: **${
                currentSalmonRunEvent.setting.coopStage.name
              }**.\nWeapons:\n${eventWeaponString}`,
            );
          }
          await scheduleData.nodes.forEach(async (entry) => {
            let salmonRotationTime = `<t:${
              Date.parse(entry.startTime) / 1000
            }:f>`;
            let weaponString = "";
            await entry.setting.weapons.forEach((weapon) => {
              weaponString += `- ${weapon.name}\n`;
            });
            splat3Embed.addField(
              `${salmonRotationTime}\n${entry.setting.coopStage.name}\n${entry.__splatoon3ink_king_salmonid_guess}`,
              weaponString,
              true,
            );
          });
          if (
            currentSalmonRunEvent &&
            Date.now() >= Date.parse(currentSalmonRunEvent.startTime)
          ) {
            splat3Embed.setImage(
              currentSalmonRunEvent.setting.coopStage.image.url,
            );
          } else {
            splat3Embed
              .setImage(currentMaps.setting.coopStage.thumbnailImage.url)
              .setFooter({
                text: `Image is from ${currentMaps.setting.coopStage.name}.`,
              });
          }
        } else if (inputMode == splatfestBattleID) {
          // Splatfest
          let splatfestScheduleDescription = `${currentFest.title}\n`;
          responseSplatfest = await axios.get(splatfestAPI);
          splatfestData = responseSplatfest.data[
            inputRegion
          ].data.festRecords.nodes.find(
            (fest) => fest.startTime == currentFest.startTime,
          );
          let splatfestDefender = null;
          await splatfestData.teams.forEach((team) => {
            if (splatfestTeamIndex !== 0)
              splatfestScheduleDescription += " vs. ";
            splatfestTeamIndex++;
            splatfestScheduleDescription += team.teamName;
            if (team.role == "DEFENSE") splatfestDefender = team.teamName;
          });
          splatfestScheduleDescription += `\nDuration: <t:${
            Date.parse(currentFest.startTime) / 1000
          }:f>-<t:${Date.parse(currentFest.endTime) / 1000}:f>`;
          let tricolorSchedule = `<t:${
            Date.parse(currentFest.midtermTime) / 1000
          }:f>-<t:${Date.parse(currentFest.endTime) / 1000}:f>`;
          if (splatfestDefender)
            tricolorSchedule += `\nDefense: Team ${splatfestDefender}`;
          tricolorSchedule += `\n${currentFest.tricolorStage.name}`;
          splat3Embed
            .setDescription(splatfestScheduleDescription)
            .addField("Tricolor Battle:", tricolorSchedule, false)
            .setImage(splatfestData.image.url);
        }
        if (
          [turfWarID, anarchyID, splatfestBattleID, xBattleID].includes(
            inputMode,
          )
        ) {
          // Turf War, Anarchy, xBattle and SplatfestTW
          await scheduleData.nodes.forEach((entry) => {
            entrySettings = entry[modeSettings];
            let mapEntryTimes = `<t:${
              Date.parse(entry.startTime) / 1000
            }:t>-<t:${Date.parse(entry.endTime) / 1000}:t>`;
            let mapEntryTitle = mapEntryTimes;
            if (inputMode == anarchyID) {
              entrySettings = entrySettings[modeIndex];
              mapEntryTitle += `\n${entrySettings.vsRule.name}`;
            }
            if (!entrySettings) return;
            let entryMaps = `${entrySettings.vsStages[0].name}\n${entrySettings.vsStages[1].name}`;
            splat3Embed.addField(
              mapEntryTitle,
              `${entrySettings.vsStages[0].name}\n${entrySettings.vsStages[1].name}`,
              true,
            );
          });
          if ([turfWarID, anarchyID, xBattleID].includes(inputMode)) {
            splat3Embed
              .setImage(
                currentMapsSettings.vsStages[randomStageIndex].image.url,
              )
              .setFooter({
                text: `Image is from ${currentMapsSettings.vsStages[randomStageIndex].name}.`,
              });
          }
        } else if (inputMode == challengesID)
          await scheduleData.nodes.forEach(async (entry) => {
            let challengeName = entry.leagueMatchSetting.leagueMatchEvent.name;
            let challengeDesc = entry.leagueMatchSetting.leagueMatchEvent.desc;
            let challengeDescLong =
              entry.leagueMatchSetting.leagueMatchEvent.regulation
                .replaceAll("<br />", "")
                .replaceAll("・", "\n- ");
            let challengeMode = entry.leagueMatchSetting.vsRule.name;
            let challengeMaps = `${entry.leagueMatchSetting.vsStages[0].name}, ${entry.leagueMatchSetting.vsStages[1].name}`;
            let challengeTimes = "";
            await entry.timePeriods.forEach((challengeTimePeriod) => {
              challengeTimes += `- <t:${
                Date.parse(challengeTimePeriod.startTime) / 1000
              }:f>-<t:${Date.parse(challengeTimePeriod.endTime) / 1000}:t>\n`;
            });
            splat3Embed.addField(
              entry.leagueMatchSetting.leagueMatchEvent.name,
              `**${challengeDesc}**\n${challengeDescLong}\n**Mode:** ${challengeMode}\n**Maps:** ${challengeMaps}\n**Times:**\n${challengeTimes}`,
              false,
            );
          });
        break;
      case "splatnet":
        let responseSplatnet = await axios.get(splatnetAPI);
        if (responseSplatnet.status != 200)
          return sendMessage({
            client: client,
            interaction: interaction,
            content: `Error occurred getting SplatNet3 data. Please try again later.`,
          });
        let splatnetData = responseSplatnet.data.data.gesotown;
        // Limited time brand
        splat3Embed.addField(
          `Daily Drop (${splatnetData.pickupBrand.brand.name})`,
          `${splatnetData.pickupBrand.brand.name} Common Ability: ${
            splatnetData.pickupBrand.brand.usualGearPower.name
          }\nDaily Drop (${
            splatnetData.pickupBrand.nextBrand.name
          }) starts <t:${
            Date.parse(splatnetData.pickupBrand.saleEndTime) / 1000
          }:R>.`,
          false,
        );
        await splatnetData.pickupBrand.brandGears.forEach((brandGear) => {
          let brandGearString = getGearString(brandGear, "brand");
          splat3Embed.addField(brandGear.gear.name, brandGearString, true);
        });
        // Individual gear pieces
        splat3Embed.addField(
          "Gear On Sale Now",
          `New item <t:${
            Date.parse(splatnetData.limitedGears[0].saleEndTime) / 1000
          }:R>.`,
          false,
        );
        await splatnetData.limitedGears.forEach((limitedGear) => {
          let limitedGearString = getGearString(limitedGear, "limited");
          splat3Embed.addField(limitedGear.gear.name, limitedGearString, true);
        });

        splat3Embed
          .setAuthor({ name: "SplatNet3 Shop" })
          .setImage(splatnetData.pickupBrand.image.url)
          .setFooter({
            text: `${splatnetData.pickupBrand.brand.name} promotional image.`,
          });
        break;
      case "splatfests":
        await interaction.deferReply({ ephemeral: ephemeral });
        // Command needs a rework once there is 1 finished Splatfest to show results, and then again when there's a second scheduled Splatfest to make sure ordering and comparisons work properly
        responseSplatfest = await axios.get(splatfestAPI);
        if (responseSplatfest.status != 200)
          return sendMessage({
            client: client,
            interaction: interaction,
            content: `Error occurred getting Splatfest data. Please try again later.`,
          });
        splatfestData =
          responseSplatfest.data[inputRegion].data.festRecords.nodes; // Usage is under the assumption that splatfests are identical between regions now. If not, a region argument should be added.
        let splatfestBanner = null;
        let isUpcomingOrOngoingSplatfest = false;
        let pointValues = { vote: 10, horagai: 10, regular: 15, challenge: 10 }; // popularity, conch shells, open, pro
        splatfestData = await splatfestData.sort(
          (a, b) => Date.parse(b.endTime) - Date.parse(a.endTime),
        );
        await splatfestData.forEach(async (splatfest) => {
          if (splatfest.title.length < 1)
            splatfest.title = "Unknown Splatfest (API error)"; // In case no valid name in API return
          let currentSplatfestPointValues = pointValues;
          // First check is for the first Splatfest system revamp, teams from here on out don't have the splatfest.teams.role (midterm winner) property
          // JUEA-00003 = Spicy|Sweet|Sour
          if (
            splatfest.endTime >
            splatfestData.find((s) => s.__splatoon3ink_id == "JUEA-00003")
              .startTime
          )
            currentSplatfestPointValues = {
              vote: 10,
              horagai: 8,
              regular: 12,
              challenge: 12,
              tricolor: 15,
            };
          // Second check is for a minor points change
          // JUEA-00005 = Nessie|Aliens|Bigfoot
          if (
            splatfest.endTime >
            splatfestData.find((s) => s.__splatoon3ink_id == "JUEA-00005")
              .startTime
          )
            currentSplatfestPointValues = {
              vote: 8,
              horagai: 7,
              regular: 12,
              challenge: 12,
              tricolor: 18,
            };
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
          }
          let midTermWinner = null;
          let splatfestResultsTitle = "**Results:** ({1})";
          let splatfestResultsTitleTeams = "";
          let splatfestResultsDescription = "";
          let splatfestWinnerPoints = 0;
          let splatfestResultsVote = "- Popularity: ";
          let splatfestResultsHoragai = "- Conch Shells: ";
          let splatfestResultsRegular = "- Open Battles: ";
          let splatfestResultsChallenge = "- Pro Battles: ";
          let splatfestResultsTricolor = "- Tricolor Battles: ";
          let splatfestResultsWinner = "**Winner: Team {1} ({2}p)**";
          splatfestTeamIndex = 0;
          let splatfestIdols = {
            0: "Shiver",
            1: "Frye",
            2: "Big Man",
          };
          await splatfest.teams.forEach(async (team) => {
            if (team.teamName.length < 1)
              team.teamName = splatfestIdols[splatfestTeamIndex]; // In case no valid name in API return
            if (splatfestTeamIndex !== 0) {
              splatfestDescription += " vs. ";
              splatfestResultsTitleTeams += "|";
              splatfestResultsVote += "|";
              splatfestResultsHoragai += "|";
              splatfestResultsRegular += "|";
              splatfestResultsChallenge += "|";
              splatfestResultsTricolor += "|";
            }
            splatfestTeamIndex++;
            if (team.result && team.result.isWinner) {
              splatfestDescription += `**${team.teamName}**`;
              splatfestResultsTitleTeams += `**${team.teamName}**`;
              if (team.result.isVoteRatioTop)
                splatfestWinnerPoints += currentSplatfestPointValues.vote;
              if (team.result.isHoragaiRatioTop)
                splatfestWinnerPoints += currentSplatfestPointValues.horagai;
              if (team.result.isRegularContributionRatioTop)
                splatfestWinnerPoints += currentSplatfestPointValues.regular;
              if (team.result.isChallengeContributionRatioTop)
                splatfestWinnerPoints += currentSplatfestPointValues.challenge;
              if (team.result.isTricolorContributionRatioTop)
                splatfestWinnerPoints += currentSplatfestPointValues.tricolor;
              splatfestResultsWinner = splatfestResultsWinner
                .replace("{1}", team.teamName)
                .replace("{2}", splatfestWinnerPoints);
            } else {
              splatfestDescription += team.teamName;
              splatfestResultsTitleTeams += team.teamName;
            }
            if (splatfest.state == "CLOSED") {
              // There HAS to be a cleaner way to do this but i don't care enough to figure it out right now, forEach didn't want to work on the object
              if (team.result && team.result.voteRatio) {
                let voteResultString = `${
                  Math.round(team.result.voteRatio * 10000) / 100
                }%`;
                if (team.result.isVoteRatioTop)
                  voteResultString = `**${voteResultString}**`;
                splatfestResultsVote += voteResultString;
              }
              if (team.result && team.result.horagaiRatio) {
                let conchShellResultString = `${
                  Math.round(team.result.horagaiRatio * 10000) / 100
                }%`;
                if (team.result.isHoragaiRatioTop)
                  conchShellResultString = `**${conchShellResultString}**`;
                splatfestResultsHoragai += conchShellResultString;
              }
              if (team.result && team.result.regularContributionRatio) {
                let regularBattleResultString = `${
                  Math.round(team.result.regularContributionRatio * 10000) / 100
                }%`;
                if (team.result.isRegularContributionRatioTop)
                  regularBattleResultString = `**${regularBattleResultString}**`;
                splatfestResultsRegular += regularBattleResultString;
              }
              if (team.result && team.result.challengeContributionRatio) {
                let proBattleResultString = `${
                  Math.round(team.result.challengeContributionRatio * 10000) /
                  100
                }%`;
                if (team.result.isChallengeContributionRatioTop)
                  proBattleResultString = `**${proBattleResultString}**`;
                splatfestResultsChallenge += proBattleResultString;
              }
              if (team.result && team.result.tricolorContributionRatio) {
                let tricolorBattleResultString = `${
                  Math.round(team.result.tricolorContributionRatio * 10000) /
                  100
                }%`;
                if (team.result.isTricolorContributionRatioTop)
                  tricolorBattleResultString = `**${tricolorBattleResultString}**`;
                splatfestResultsTricolor += tricolorBattleResultString;
              }
            }
            if (team.role == "DEFENSE") midTermWinner = team.teamName;
          });
          if (splatfest.teams[0].result) {
            splatfestResultsTitle = splatfestResultsTitle.replace(
              "{1}",
              splatfestResultsTitleTeams,
            );
            splatfestResultsDescription += `${splatfestResultsVote} (${currentSplatfestPointValues.vote}p)\n${splatfestResultsHoragai} (${currentSplatfestPointValues.horagai}p)\n${splatfestResultsRegular} (${currentSplatfestPointValues.regular}p)\n${splatfestResultsChallenge} (${currentSplatfestPointValues.challenge}p)`;
            if (!midTermWinner)
              splatfestResultsDescription += `\n${splatfestResultsTricolor} (${currentSplatfestPointValues.tricolor}p)`;
            splatfestResultsDescription += `\n${splatfestResultsWinner}`;
          }
          splatfestDescription += `\n<t:${
            Date.parse(splatfest.startTime) / 1000
          }:d>-<t:${Date.parse(splatfest.endTime) / 1000}:d>`;
          if (midTermWinner)
            splatfestDescription += `\nTricolor Defense: Team ${midTermWinner}`;
          if (splatfest.teams[0].result)
            splatfestDescription += `\n${splatfestResultsTitle}\n${splatfestResultsDescription}`;
          splat3Embed.addField(splatfestTitle, splatfestDescription, false);
        });
        splat3Embed
          .setAuthor({ name: "Splatfests" })
          .setImage(splatfestBanner)
          .setFooter({
            text: "Image is from upcoming or most recent Splatfest.",
          });
        if (!isUpcomingOrOngoingSplatfest)
          splat3Embed.setDescription(
            "Note: Upcoming Splatfests will only be available here once you can choose a team ingame.",
          );
        break;
      case "replay":
        let replayCode = interaction.options.getString("code");
        replayCode = replayCode.replace("-", "");
        let replayResponse = await axios.get(
          `${replayAPI}${replayCode.toUpperCase()}`,
        );
        if (replayResponse.status !== 200)
          return interaction.reply({
            content:
              "Error occurred getting that replay. Make sure the code is correct.",
          });
        let replayData = replayResponse.data.replay.historyDetail;
        let replayIsTurfWar = replayData.vsRule.name == "Turf War";
        // Match data
        let replayTimestamp = `Timestamp: <t:${
          Date.parse(replayData.playedTime) / 1000
        }:f>`;
        let replayMode = `${replayData.vsRule.name} Replay`;
        if (!replayIsTurfWar) replayMode += ` (${replayData.vsMode.name})`;
        let replayStage = `Stage: ${replayData.vsStage.name}`;
        let replayResult = `Result: ${replayData.judgement}`;
        if (replayData.knockout !== "NEITHER") {
          replayResult += ` (KNOCKOUT)`;
        } else if (replayData.myTeam.result.score) {
          replayResult += ` (83 points)`;
        }
        let matchData = `${replayStage}\n${replayResult}\n${replayTimestamp}`;
        // Player data
        let playerData = [];
        playerData.push(
          `Player: ${replayData.player.name}#${replayData.player.nameId} (${replayData.player.byname})`,
        );
        playerData.push(`Weapon: ${replayData.player.weapon.name}`);
        playerData.push(`Head: ${replayData.player.headGear.name}`);
        playerData.push(`Clothing: ${replayData.player.clothingGear.name}`);
        playerData.push(`Shoes: ${replayData.player.shoesGear.name}`);
        if (replayIsTurfWar)
          playerData.push(`Points: ${replayData.myTeam.result.paintPoint}`);
        // Skills
        let headSkills = [
          `**${replayData.player.headGear.primaryGearPower.name}**`,
        ];
        replayData.player.headGear.additionalGearPowers.forEach((power) => {
          headSkills.push(power.name);
        });
        let clothingSkills = [
          `**${replayData.player.clothingGear.primaryGearPower.name}**`,
        ];
        replayData.player.clothingGear.additionalGearPowers.forEach((power) => {
          clothingSkills.push(power.name);
        });
        let shoesSkills = [
          `**${replayData.player.shoesGear.primaryGearPower.name}**`,
        ];
        replayData.player.shoesGear.additionalGearPowers.forEach((power) => {
          shoesSkills.push(power.name);
        });
        // Awards
        let replayAwards = [];
        replayData.awards.forEach((award) => {
          replayAwards.push(award.name);
        });

        splat3Embed
          .setAuthor({ name: replayMode })
          .setThumbnail(replayData.player.weapon.image.url)
          .setDescription(matchData)
          .addField("Player Data:", playerData.join("\n"), false)
          .addField(
            `${replayData.player.headGear.name} Skills:`,
            headSkills.join("\n"),
            false,
          )
          .addField(
            `${replayData.player.clothingGear.name} Skills:`,
            clothingSkills.join("\n"),
            false,
          )
          .addField(
            `${replayData.player.shoesGear.name} Skills:`,
            shoesSkills.join("\n"),
            false,
          );
        if (replayAwards.length > 0)
          splat3Embed.addField("Awards:", replayAwards.join("\n"), false);
        splat3Embed.setFooter({
          text: `Replay ID: ${replayResponse.data.replay.replayCode}`,
        });
        break;
      case "splashtag-random":
        let userTitle = interaction.member.nickname;
        if (!userTitle) userTitle = interaction.user.username;

        let adjectives = Object.values(
          languageJSON["CommonMsg/Byname/BynameAdjective"],
        ).filter((adjective) => !adjective.includes("[") && adjective !== "");
        let randomAdjective =
          adjectives[randomNumber(0, adjectives.length - 1)];
        let subjects = Object.values(
          languageJSON["CommonMsg/Byname/BynameSubject"],
        ).filter((subject) => !subject.includes("[") && subject !== "");
        let randomSubject = subjects[randomNumber(0, subjects.length - 1)];

        let reversedLanguages = ["EUfr", "EUes", "EUit"];
        let randomTitle = `${randomAdjective} ${randomSubject}`;
        if (reversedLanguages.includes(languageKey))
          randomTitle = `${randomSubject} ${randomAdjective}`;

        let bannerOptions = fs
          .readdirSync("submodules/splat3/images/npl/")
          .filter((file) => file.endsWith(".png"));
        let badgeOptions = fs
          .readdirSync("submodules/splat3/images/badge/")
          .filter((file) => file.endsWith(".png"));
        let bannerRandom =
          bannerOptions[randomNumber(0, bannerOptions.length - 1)];
        let badgeRandom =
          badgeOptions[randomNumber(0, badgeOptions.length - 1)];
        let badgeRandom2 =
          badgeOptions[randomNumber(0, badgeOptions.length - 1)];
        let badgeRandom3 =
          badgeOptions[randomNumber(0, badgeOptions.length - 1)];

        splat3Embed
          .setAuthor({
            name: randomTitle,
            iconURL: `${githubRaw}images/badge/${badgeRandom}`,
          })
          .setTitle(userTitle)
          .setThumbnail(`${githubRaw}images/badge/${badgeRandom2}`)
          .setImage(`${githubRaw}images/npl/${bannerRandom}`)
          .setFooter({ iconURL: `${githubRaw}images/badge/${badgeRandom3}` });
        break;
    }
    return sendMessage({
      client: client,
      interaction: interaction,
      embeds: splat3Embed,
      ephemeral: ephemeral,
    });

    function getGearString(gear, type) {
      let limitedGearString = "";
      if (type == "limited")
        limitedGearString += `Sale ends <t:${
          Date.parse(gear.saleEndTime) / 1000
        }:R>.\n`;
      limitedGearString += `Ability: ${gear.gear.primaryGearPower.name}\n`;
      let limitedGearStars = star.repeat(
        gear.gear.additionalGearPowers.length - 1,
      );
      let limitedGearStarString = `Slots: ${gear.gear.additionalGearPowers.length}`;
      if (gear.gear.additionalGearPowers.length > 1)
        limitedGearStarString += ` (${limitedGearStars})`;
      limitedGearString += `${limitedGearStarString}\n`;
      limitedGearString += `Brand: ${gear.gear.brand.name}\n`;
      limitedGearString += `Price: ${gear.price}\n`;
      return limitedGearString;
    }
  } catch (e) {
    // Log error
    logger(e, client, interaction);
  }
};

let splatoon3Languages = [
  { name: "English", value: "EUen" },
  { name: "French|Français", value: "EUfr" },
  { name: "German|Deutsch", value: "EUde" },
  { name: "Spanish|Español", value: "EUes" },
  { name: "Dutch|Nederlands", value: "EUnl" },
  { name: "Italian|Italiano", value: "EUit" },
  { name: "Russian|Русский", value: "EUru" },
  { name: "Japanese|日本語", value: "JPja" },
  { name: "Korean|한국어", value: "KRko" },
  { name: "Chinese (Simplified)|中文（简体)", value: "CNzh" },
  { name: "Chinese (Traditional)|中文（繁體)", value: "TWzh" },
];
// There's also an AP region but I'm not sure what it is or how to name it. Seems to be for Oceania/Australia-ish territories.
let splatoon3Regions = [
  { value: "EU", name: "Europe" },
  { value: "US", name: "United States" },
  { value: "JP", name: "Japan" },
];
module.exports.config = {
  name: "splatoon3",
  description: `Shows Splatoon 3 data.`,
  options: [
    {
      name: "clothing",
      type: "SUB_COMMAND",
      description: "Get info on clothing.",
      options: [
        {
          name: "clothing",
          type: "STRING",
          description: "Specify a piece of clothing by name.",
          autocomplete: true,
          required: true,
        },
        {
          name: "language",
          type: "STRING",
          description: "Specify a language.",
          autocomplete: true,
        },
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
    {
      name: "weapon",
      type: "SUB_COMMAND",
      description: "Get info on a weapon.",
      options: [
        {
          name: "weapon",
          type: "STRING",
          description: "Specify a weapon by name.",
          autocomplete: true,
          required: true,
        },
        {
          name: "language",
          type: "STRING",
          description: "Specify a language.",
          autocomplete: true,
        },
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
    {
      name: "subweapon",
      type: "SUB_COMMAND",
      description: "Get info on a subweapon.",
      options: [
        {
          name: "subweapon",
          type: "STRING",
          description: "Specify a subweapon by name.",
          autocomplete: true,
          required: true,
        },
        {
          name: "language",
          type: "STRING",
          description: "Specify a language.",
          choices: splatoon3Languages,
        },
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
    {
      name: "special",
      type: "SUB_COMMAND",
      description: "Get info on a special weapon.",
      options: [
        {
          name: "special",
          type: "STRING",
          description: "Specify a special weapon by name.",
          autocomplete: true,
          required: true,
        },
        {
          name: "language",
          type: "STRING",
          description: "Specify a language.",
          choices: splatoon3Languages,
        },
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
    {
      name: "schedule",
      type: "SUB_COMMAND",
      description: "Get a mode's schedule.",
      options: [
        {
          name: "mode",
          type: "STRING",
          description: "Specify a mode.",
          autocomplete: true,
          required: true,
        },
        {
          name: "region",
          type: "STRING",
          description: "Specify a region. Default is EU.",
          choices: splatoon3Regions,
        },
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
    {
      name: "splatnet",
      type: "SUB_COMMAND",
      description: "Get SplatNet3 data.",
      options: [
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
    {
      name: "splatfests",
      type: "SUB_COMMAND",
      description: "Get all Splatfests data.",
      options: [
        {
          name: "region",
          type: "STRING",
          description: "Specify a region. Default is EU.",
          choices: splatoon3Regions,
        },
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
    {
      name: "replay",
      type: "SUB_COMMAND",
      description: "Get a replay.",
      options: [
        {
          name: "code",
          type: "STRING",
          description: "Specify a replay code.",
          required: true,
        },
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
    {
      name: "splashtag-random",
      type: "SUB_COMMAND",
      description: "Generate a random splashtag.",
      options: [
        {
          name: "language",
          type: "STRING",
          description: "Specify a language.",
          choices: splatoon3Languages,
        },
        {
          name: "ephemeral",
          type: "BOOLEAN",
          description: "Whether the reply will be private.",
        },
      ],
    },
  ],
};
