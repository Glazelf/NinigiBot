import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder,
    codeBlock,
    ActionRowBuilder,
    SlashCommandSubcommandGroupBuilder
} from "discord.js";
import axios from "axios";
import sendMessage from "../../util/sendMessage.js";
import getBossEvent from "../../util/btd/getBossEvent.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import iconsJSON from "../../objects/btd/icons.json" with { type: "json" };

const btd6api = "https://data.ninjakiwi.com/btd6/";

export default async (interaction, ephemeral) => {
    let oak = interaction.options.getString("oak");
    let apiError = null;

    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    // await interaction.deferReply(ephemeral);
    let btd6Embed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    let btd6ActionRow = new ActionRowBuilder();

    switch (interaction.options.getSubcommand()) {
        case "user":
            let saveResponse = await axios.get(`${btd6api}save/${oak}`);
            let userResponse = await axios.get(`${btd6api}users/${oak}`);
            if (!userResponse.data.success || !saveResponse.data.success) {
                apiError = userResponse.data.error;
                break;
            };
            let saveData = saveResponse.data.body;
            let userData = userResponse.data.body;
            // Rank string
            let rankString = `\nLevel: ${userData.rank}`;
            if (userData.veteranRank > 0) rankString += `\nVeteran Level: ${userData.veteranRank} ${iconsJSON["LevelVeteran"]}`;
            // General stats
            let userDescription = `${rankString}\nTotal EXP: ${saveData.xp + saveData.veteranXp}\nGames Played: ${saveData.gamesPlayed}`;
            if (saveData.achievementsClaimed.length > 0) userDescription += `\nAchievements: ${saveData.achievementsClaimed.length}/150 ${iconsJSON["Achievements"]}`; // Total achievement amount is hardcoded, doesn't seem to be a way to reverse engineer it from the data received. Make sure to update if more achievements are added!
            if (saveData.lifetimeTrophies > 0) userDescription += `\nTrophies Earned: ${saveData.lifetimeTrophies} ${iconsJSON["TrophyStore"]}`;
            if (saveData.lifetimeTeamTrophies > 0) userDescription += `\nTeam Trophies Earned: ${saveData.lifetimeTeamTrophies}`;
            // Hero and tower usage
            let heroesByUsageString = getUsageListString(userData.heroesPlaced);
            let towersByUsageString = getUsageListString(userData.towersPlaced);
            // Build user embed
            btd6Embed
                .setTitle(userData.displayName)
                .setDescription(userDescription)
                .setThumbnail(userData.avatarURL)
                .setImage(userData.bannerURL)
                .setFooter({ text: `User Profile Version: v${saveData.latestGameVersion}` })
                .addFields([
                    { name: "Heroes Placed:", value: heroesByUsageString, inline: true },
                    { name: "Towers Placed:", value: towersByUsageString, inline: true }
                ]);
            break;
        case "boss-event":
            await interaction.deferReply({ ephemeral: ephemeral });
            let bossEventMessageObject = await getBossEvent(false);
            if (typeof bossEventMessageObject == "string") {
                apiError = bossEventMessageObject;
                break;
            };
            btd6Embed = bossEventMessageObject.embeds;
            btd6ActionRow = bossEventMessageObject.components;
            break;
    };
    // Handle API errors
    if (apiError) {
        ephemeral = true; // Error reply should be ephemeral
        btd6Embed
            .setTitle("Error")
            .setColor(globalVars.embedColorError)
            .setDescription(`The following error occurred while getting data from the API:${codeBlock("fix", apiError)}Read more on the Ninja Kiwi API and Open Access Keys (OAKs) [here](<https://support.ninjakiwi.com/hc/en-us/articles/13438499873937-Open-Data-API>).`);
    };
    return sendMessage({ interaction: interaction, embeds: btd6Embed, components: btd6ActionRow, ephemeral: ephemeral });
};

function getUsageListString(usageObject) {
    // Rosalia icon is missing
    let usageArray = Object.entries(usageObject).sort((a, b) => b[1] - a[1]);
    let usageString = "";
    usageArray.forEach(element => {
        if (iconsJSON[element[0]]) usageString += iconsJSON[element[0]];
        usageString += `${element[0]}: ${element[1]}\n`;
    });
    return usageString;
};

// String options
const oakOption = new SlashCommandStringOption()
    .setName("oak")
    .setDescription("Specify Open Access Key.")
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const userSubcommand = new SlashCommandSubcommandBuilder()
    .setName("user")
    .setDescription("See information on a user.")
    .addStringOption(oakOption)
    .addBooleanOption(ephemeralOption);
const bossEventSubcommand = new SlashCommandSubcommandBuilder()
    .setName("boss-event")
    .setDescription("See current boss event.")
    .addBooleanOption(ephemeralOption);
// Subcommand groups
const btd6SubcommandGroup = new SlashCommandSubcommandGroupBuilder()
    .setName("6")
    .setDescription("BTD6")
    .addSubcommand(userSubcommand)
    .addSubcommand(bossEventSubcommand);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("btd")
    .setDescription("Shows Bloons Tower Defense data.")
    .addSubcommandGroup(btd6SubcommandGroup);