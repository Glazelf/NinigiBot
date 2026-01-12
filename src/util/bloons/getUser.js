import {
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import axios from "axios";
import getAPIErrorMessageObject from "./getAPIErrorMessageObject.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const btd6api = "https://data.ninjakiwi.com/btd6/";

export default async ({ interaction, oak, messageFlags }) => {
    const btd6Embed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    let saveResponse = await axios.get(`${btd6api}save/${oak}`);
    let userResponse = await axios.get(`${btd6api}users/${oak}`);
    if (!userResponse.data.success || !saveResponse.data.success) {
        // Embed is copied from bloons command and should be kept consistent
        let APIErrorMessageObject = getAPIErrorMessageObject(userResponse.data.error);
        messageFlags.add(MessageFlags.Ephemeral);
        return { embeds: APIErrorMessageObject.embeds, messageFlags: messageFlags };
    };
    let saveData = saveResponse.data.body;
    let saveModel = saveResponse.data.model;
    let userData = userResponse.data.body;
    // Rank string
    let rankString = "\nLevel: ";
    if (userData.veteranRank > 0) {
        let veteranEmoji = interaction.client.application.emojis.cache.find(emoji => emoji.name == "BTD6LevelVeteran");
        rankString += userData.veteranRank;
        if (veteranEmoji) rankString += ` ${veteranEmoji}`;
    } else {
        rankString += userData.rank;
    };
    // General stats
    let userDescription = `${rankString}\nTotal EXP: ${saveData.xp + saveData.veteranXp}\nBloons Popped: ${userData.bloonsPopped.bloonsPopped}`;
    let redBloonEmoji = interaction.client.application.emojis.cache.find(emoji => emoji.name == "BTD6RedBloon");
    if (redBloonEmoji) userDescription += ` ${redBloonEmoji}`;
    userDescription += `\nGames Played: ${saveData.gamesPlayed}`;
    if (saveData.lifetimeTrophies > 0) {
        let trophyStoreEmoji = interaction.client.application.emojis.cache.find(emoji => emoji.name == "BTD6TrophyStore");
        userDescription += `\nTrophies Earned: ${saveData.lifetimeTrophies}`;
        if (trophyStoreEmoji) userDescription += ` ${trophyStoreEmoji}`;
    };
    if (saveData.achievementsClaimed.length > 0) {
        let achievementsEmoji = interaction.client.application.emojis.cache.find(emoji => emoji.name == "BTD6Achievement");
        userDescription += `\nAchievements: ${saveData.achievementsClaimed.length}/${saveModel.parameters.achievementsClaimed.default.length}`;
        if (achievementsEmoji) userDescription += ` ${achievementsEmoji}`;
    };
    //// "Maps Completed" is confusing. Does it mean any map beaten at least once or black bordered? Work out black border checks sometime.
    //// Logic below just checks if a map has been beaten at least once
    // let realMaps = Object.entries(saveData.mapProgress).filter(map => map[0] !== "Tutorial");
    // userDescription += `\nMaps Completed: ${realMaps.filter(map => map[1].complete === true).length}/${realMaps.length}`;
    let questEmoji = interaction.client.application.emojis.cache.find(emoji => emoji.name == "BTD6Quest");
    userDescription += `\nQuests Completed: ${saveData.quests.filter(quest => quest.complete === true).length}/${saveData.quests.length}`;
    if (questEmoji) userDescription += ` ${questEmoji}`;

    if (saveData.lifetimeTeamTrophies > 0) userDescription += `\nTeam Trophies Earned: ${saveData.lifetimeTeamTrophies}`;
    // Hero and tower usage
    let heroesByUsageString = getUsageListString(userData.heroesPlaced, interaction.client.application.emojis.cache);
    let towersByUsageString = getUsageListString(userData.towersPlaced, interaction.client.application.emojis.cache);
    // Build user embed
    btd6Embed
        .setTitle(userData.displayName)
        .setDescription(userDescription)
        .setThumbnail(userData.avatarURL)
        .setImage(userData.bannerURL)
        .setFooter({ text: `Profile Version: v${saveData.latestGameVersion}\nCreator Code: Glaze` })
        .addFields([
            { name: "Heroes Placed:", value: heroesByUsageString, inline: true },
            { name: "Towers Placed:", value: towersByUsageString, inline: true }
        ]);
    return { embeds: [btd6Embed], messageFlags: messageFlags };
};

function getUsageListString(usageObject, emojis) {
    let usageArray = Object.entries(usageObject).sort((a, b) => b[1] - a[1]);
    let usageString = "";
    usageArray.forEach(element => {
        let heroIcon = emojis.find(emoji => emoji.name == `BTD6Hero${element[0]}`);
        if (heroIcon) usageString += heroIcon.toString(); // toString() because without it the emoji gets represented by just the ID for some reason
        usageString += `${element[0]}: ${element[1]}\n`;
    });
    return usageString;
};