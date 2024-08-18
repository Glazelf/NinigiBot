import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import axios from "axios";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import iconsJSON from "../../objects/btd6/icons.json" with { type: "json" };

const btd6api = "https://data.ninjakiwi.com/btd6/";

export default async (elite = false) => {
    let bossEventsResponse = await axios.get(`${btd6api}bosses`);
    if (!bossEventsResponse.data.success) return bossEventsResponse.data.error;
    let mostRecentBossEvent = bossEventsResponse.data.body[0];
    // Check if next boss event can be seen when no boss event is ongoing?
    if (mostRecentBossEvent.end < Date.now()) {
        btd6Embed
            .setTitle("Boss Event")
            .setColor(globalVars.embedColor)
            .setDescription("No boss event is currently ongoing.");
    };

    let metadataURL = mostRecentBossEvent.metadataStandard;
    if (elite) metadataURL = mostRecentBossEvent.metadataElite;
    let bossEventMetadataResponse = await axios.get(metadataURL);
    if (!bossEventMetadataResponse.data.success) return bossEventMetadataResponse.data.error;

    let bossEventMetadata = bossEventMetadataResponse.data.body;
    let bossEventTitle = "Boss Event - ";
    if (elite) bossEventTitle += "Elite ";
    bossEventTitle += mostRecentBossEvent.bossType.charAt(0).toUpperCase() + mostRecentBossEvent.bossType.slice(1); // Capitalize first character
    let bossEventDescription = `<t:${Math.floor(mostRecentBossEvent.start / 1000)}:f> to <t:${Math.floor(mostRecentBossEvent.end / 1000)}:f>`;

    let rulesArray = [
        `Score: ${mostRecentBossEvent.scoringType}`,
        `Map: ${bossEventMetadata.map}`,
        `Difficulty: ${bossEventMetadata.difficulty}`,
        `Lives: ${bossEventMetadata.lives}`,
        `Starting Cash: ${bossEventMetadata.startingCash}`,
        `Max Paragons: ${bossEventMetadata.maxParagons}`
    ];
    if (bossEventMetadata.abilityCooldownReductionMultiplier !== 1) rulesArray.push(`Ability Cooldowns: ${bossEventMetadata.abilityCooldownReductionMultiplier * 100}%`);
    if (bossEventMetadata.removeableCostMultiplier !== 1) rulesArray.push(`Removeables Cost: ${bossEventMetadata.removeableCostMultiplier * 100}%`);
    if (bossEventMetadata._bloonModifiers.speedMultiplier !== 1) rulesArray.push(`Bloon Speed: ${bossEventMetadata._bloonModifiers.speedMultiplier * 100}%`);
    if (bossEventMetadata._bloonModifiers.healthMultipliers.bloons !== 1) rulesArray.push(`Bloon Health: ${bossEventMetadata._bloonModifiers.healthMultipliers.bloons * 100}%`);
    if (bossEventMetadata._bloonModifiers.moabSpeedMultiplier !== 1) rulesArray.push(`MOAB Speed: ${bossEventMetadata._bloonModifiers.moabSpeedMultiplier * 100}%`);
    if (bossEventMetadata._bloonModifiers.healthMultipliers.moabs !== 1) rulesArray.push(`MOAB Health: ${bossEventMetadata._bloonModifiers.healthMultipliers.moab * 100}%`);
    if (bossEventMetadata._bloonModifiers.bossSpeedMultiplier !== 1) rulesArray.push(`Boss Speed: ${bossEventMetadata._bloonModifiers.bossSpeedMultiplier * 100}%`);
    if (bossEventMetadata._bloonModifiers.healthMultipliers.boss !== 1) rulesArray.push(`Boss Health: ${bossEventMetadata._bloonModifiers.healthMultipliers.boss * 100}%`);
    if (bossEventMetadata._bloonModifiers.regrowRateMultiplier !== 1) rulesArray.push(`Regrow Rate: ${bossEventMetadata._bloonModifiers.regrowRateMultiplier * 100}%`);
    if (bossEventMetadata._bloonModifiers.allCamo) rulesArray.push(`All bloons are camo.`);
    if (bossEventMetadata._bloonModifiers.allRegen) rulesArray.push(`All bloons are regen.`);
    let rulesString = rulesArray.join("\n");

    let allowedHeroesArray = [];
    let allowedTowersArray = [];
    bossEventMetadata._towers.forEach(tower => {
        let towerIcon = iconsJSON[tower.tower];
        if (tower.max == 0 || tower.tower == "ChosenPrimaryHero") return;
        if (tower.isHero && towerIcon) {
            allowedHeroesArray.push(`${towerIcon}${tower.tower}`);
        } else {
            let towerString = tower.tower;
            if (tower.path1NumBlockedTiers > 0 || tower.path2NumBlockedTiers || tower.path3NumBlockedTiers) towerString += ` (${5 - tower.path1NumBlockedTiers}-${5 - tower.path2NumBlockedTiers}-${5 - tower.path3NumBlockedTiers})`;
            if (tower.max > 0) towerString += ` (max ${tower.max})`;
            allowedTowersArray.push(towerString);
        };
    });
    let allowedHeroesString = allowedHeroesArray.join("\n");
    if (allowedHeroesArray.length == 0) allowedHeroesString = "None.";
    let allowedTowersString = allowedTowersArray.join("\n");

    let bossEventEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(bossEventTitle)
        .setDescription(bossEventDescription)
        .setThumbnail(bossEventMetadata.mapURL)
        .setImage(mostRecentBossEvent.bossTypeURL)
        .addFields([
            { name: "Rules & Modifiers:", value: rulesString, inline: false },
            { name: "Heroes:", value: allowedHeroesString, inline: true },
            { name: "Towers:", value: allowedTowersString, inline: true }
        ]);

    const bossEventActionRow = new ActionRowBuilder();
    const bossEventEliteButton = new ButtonBuilder()
        .setCustomId(`btd6BossEventElite|${elite}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel("Elite");
    if (elite) {
        bossEventEliteButton
            .setStyle(ButtonStyle.Primary)
            .setLabel("Standard");
    };
    bossEventActionRow.addComponents(bossEventEliteButton);

    return { embeds: bossEventEmbed, components: bossEventActionRow };
};