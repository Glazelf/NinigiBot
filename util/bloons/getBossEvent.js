import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    time,
    TimestampStyles
} from "discord.js";
import axios from "axios";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const btd6api = "https://data.ninjakiwi.com/btd6/";
const heroesOrdered = [
    "Quincy",
    "Gwendolin",
    "StrikerJones",
    "ObynGreenfoot",
    "Silas",
    "Rosalia",
    "CaptainChurchill",
    "Benjamin",
    "PatFusty",
    "Ezili",
    "Adora",
    "Etienne",
    "Sauda",
    "AdmiralBrickell",
    "Psi",
    "Geraldo",
    "Corvus"
];
const towersOrdered = [
    "DartMonkey",
    "BoomerangMonkey",
    "BombShooter",
    "TackShooter",
    "IceMonkey",
    "GlueGunner",
    "SniperMonkey",
    "MonkeySub",
    "MonkeyBuccaneer",
    "MonkeyAce",
    "HeliPilot",
    "MortarMonkey",
    "DartlingGunner",
    "WizardMonkey",
    "SuperMonkey",
    "NinjaMonkey",
    "Alchemist",
    "Druid",
    "Mermonkey",
    "BananaFarm",
    "SpikeFactory",
    "MonkeyVillage",
    "EngineerMonkey",
    "BeastHandler"
];

export default async ({ elite = false, emojis }) => {
    let bossEventsResponse = await axios.get(`${btd6api}bosses`);
    if (!bossEventsResponse.data.success) return bossEventsResponse.data.error;
    let bossEventSelected = bossEventsResponse.data.body.find(event => event.start < Date.now() && event.end > Date.now());
    if (!bossEventSelected) bossEventSelected = bossEventsResponse.data.body[0];

    let metadataURL = bossEventSelected.metadataStandard;
    if (elite) metadataURL = bossEventSelected.metadataElite;
    let bossEventMetadataResponse = await axios.get(metadataURL);
    if (!bossEventMetadataResponse.data.success) return bossEventMetadataResponse.data.error;

    let bossEventMetadata = bossEventMetadataResponse.data.body;
    let bossEventTitle = "Boss Event - ";
    if (elite) bossEventTitle += "Elite ";
    bossEventTitle += bossEventSelected.bossType.charAt(0).toUpperCase() + bossEventSelected.bossType.slice(1); // Capitalize first character

    let rulesArray = [
        `Score: ${bossEventSelected.scoringType}`,
        `Map: ${bossEventMetadata.map}`,
        `Difficulty: ${bossEventMetadata.difficulty}`,
        `Lives: ${bossEventMetadata.lives}`,
        `Starting Cash: ${bossEventMetadata.startingCash}`,
        `Max Paragons: ${bossEventMetadata.maxParagons}`
    ];
    // Math.round() is to avoid JS floating point errors
    if (bossEventMetadata.maxTowers < 9999) rulesArray.push(`Max Towers: ${bossEventMetadata.maxTowers}`);
    if (bossEventMetadata.abilityCooldownReductionMultiplier !== 1) rulesArray.push(`Ability Cooldowns: ${Math.round(bossEventMetadata.abilityCooldownReductionMultiplier * 100)}%`);
    if (bossEventMetadata.removeableCostMultiplier !== 1) rulesArray.push(`Removeables Cost: ${Math.round(bossEventMetadata.removeableCostMultiplier * 100)}%`);
    if (bossEventMetadata._bloonModifiers.healthMultipliers.bloons !== 1) rulesArray.push(`Bloon Health: ${Math.round(bossEventMetadata._bloonModifiers.healthMultipliers.bloons * 100)}%`);
    if (bossEventMetadata._bloonModifiers.speedMultiplier !== 1) rulesArray.push(`Bloon Speed: ${Math.round(bossEventMetadata._bloonModifiers.speedMultiplier * 100)}%`);
    if (bossEventMetadata._bloonModifiers.healthMultipliers.moabs !== 1) rulesArray.push(`MOAB Health: ${Math.round(bossEventMetadata._bloonModifiers.healthMultipliers.moabs * 100)}%`);
    if (bossEventMetadata._bloonModifiers.moabSpeedMultiplier !== 1) rulesArray.push(`MOAB Speed: ${Math.round(bossEventMetadata._bloonModifiers.moabSpeedMultiplier * 100)}%`);
    if (bossEventMetadata._bloonModifiers.healthMultipliers.boss !== 1) rulesArray.push(`Boss Health: ${Math.round(bossEventMetadata._bloonModifiers.healthMultipliers.boss * 100)}%`);
    if (bossEventMetadata._bloonModifiers.bossSpeedMultiplier !== 1) rulesArray.push(`Boss Speed: ${Math.round(bossEventMetadata._bloonModifiers.bossSpeedMultiplier * 100)}%`);
    if (bossEventMetadata._bloonModifiers.regrowRateMultiplier !== 1) rulesArray.push(`Regrow Rate: ${Math.round(bossEventMetadata._bloonModifiers.regrowRateMultiplier * 100)}%`);
    if (bossEventMetadata._bloonModifiers.allCamo) rulesArray.push(`All bloons are camo.`);
    if (bossEventMetadata._bloonModifiers.allRegen) rulesArray.push(`All bloons are regen.`);
    let rulesString = rulesArray.join("\n");

    let bossEventDescription = `Starts: ${time(Math.floor(bossEventSelected.start / 1000), TimestampStyles.ShortDateTime)}\nEnds: ${time(Math.floor(bossEventSelected.end / 1000), TimestampStyles.ShortDateTime)}\n${rulesString}`;

    let allowedHeroesArray = [];
    let allowedTowersArray = [];
    let bannedArray = [];
    let towersAllowedAppendix = false;
    let allHeroesAllowed = bossEventMetadata._towers.find((hero) => hero.tower == "ChosenPrimaryHero").max == 99; // This seems to be how to check if all heroes are allowed? Even when this is 99, heroes inconsistently have either a max of 0 or 1, making it hard to tell otherwise
    bossEventMetadata._towers.forEach(tower => {
        let towerIcon = emojis.find(emoji => emoji.name == `BTD6Hero${tower.tower}`);
        if (tower.tower == "ChosenPrimaryHero") return; // Skip the ChosenPrimaryHero tower
        if (tower.isHero) {
            let heroString = tower.tower;
            if (towerIcon) heroString = `${towerIcon}${heroString}`;
            if (tower.max == 0 && !allHeroesAllowed) return bannedArray.push(heroString);
            return allowedHeroesArray.push(heroString);
        } else {
            let towerString = tower.tower;
            if (tower.max > 0) {
                towerString += ` (max ${tower.max})`;
                towersAllowedAppendix = true;
            } else if (tower.max == 0) {
                return bannedArray.push(towerString);
            };
            if (tower.path1NumBlockedTiers > 0 || tower.path2NumBlockedTiers || tower.path3NumBlockedTiers) {
                // Sometimes allowed tier is -1 when they mean 0, leading to above calculation listing 6. 
                // We can filter like this because if not all tiers are allowed the paragon can never be made, making 6-6-6 impossible.
                towerString += ` (${5 - tower.path1NumBlockedTiers}-${5 - tower.path2NumBlockedTiers}-${5 - tower.path3NumBlockedTiers})`.replace(/6/g, 0);
                towersAllowedAppendix = true;
            };
            return allowedTowersArray.push(towerString);
        };
    });
    allowedHeroesArray = sortTowersToIngame(allowedHeroesArray, "heroes");
    allowedTowersArray = sortTowersToIngame(allowedTowersArray, "towers");
    bannedArray = sortTowersToIngame(bannedArray, "all");
    let allowedHeroesString = allowedHeroesArray.join("\n");
    if (allowedHeroesArray.length == 0) allowedHeroesString = "No heroes are allowed.";
    if (allowedHeroesArray.length == heroesOrdered.length) allowedHeroesString = "All heroes are allowed.";
    let allowedTowersString = allowedTowersArray.join("\n");
    let bannedString = bannedArray.join("\n");
    if (bannedString.length == 0) bannedString = "Nothing is banned.";
    if (allowedHeroesArray.length == towersOrdered.length && !towersAllowedAppendix) allowedTowersString = "All towers are allowed (5-5-5).";

    let bossEventEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(bossEventTitle)
        .setDescription(bossEventDescription)
        .setThumbnail(bossEventMetadata.mapURL)
        .setImage(bossEventSelected.bossTypeURL)
        .setFooter({ text: "Creator Code: Glaze" })
        .addFields([
            { name: "Banned:", value: bannedString, inline: false },
            { name: "Allowed Heroes:", value: allowedHeroesString, inline: true },
            { name: "Allowed Towers:", value: allowedTowersString, inline: true },

        ]);
    if (bossEventSelected.end < Date.now()) {
        bossEventEmbed.setAuthor({ name: "No boss event is currently ongoing.\nHere is info on the most recent one instead:" });
    } else if (bossEventSelected.start > Date.now()) {
        bossEventEmbed.setAuthor({ name: "No boss event is currently ongoing.\nHere is info on the next one instead:" });
    };

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

function sortTowersToIngame(towerList, type) {
    let comparisonArray = null;
    switch (type) {
        case "towers":
            comparisonArray = towersOrdered;
            break;
        case "heroes":
            comparisonArray = heroesOrdered;
            break;
        case "all":
            comparisonArray = heroesOrdered.concat(towersOrdered);
            break;
    };
    let sortedArray = towerList.sort((a, b) => {
        a = filterTowerStringToName(a);
        b = filterTowerStringToName(b);
        return comparisonArray.indexOf(a) - comparisonArray.indexOf(b);
    });
    return sortedArray;
};

function filterTowerStringToName(towerString) {
    if (towerString.includes(" ")) towerString = towerString.split(" ")[0]; // Catch towers with limited upgrades appended to the end
    if (towerString.includes(">")) towerString = towerString.split(">")[1]; // Catch heroes with emotes appended to the front
    return towerString;
};