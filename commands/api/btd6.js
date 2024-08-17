import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder,
    codeBlock
} from "discord.js";
import axios from "axios";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import heroIconsJSON from "../../objects/btd6/heroIcons.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let btd6api = "https://data.ninjakiwi.com/btd6/";
    let oak = interaction.options.getString("oak");
    let apiError = null;

    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    // await interaction.deferReply(ephemeral);
    let btd6Embed = new EmbedBuilder()
        .setColor(globalVars.embedColor);

    switch (interaction.options.getSubcommand()) {
        case "user":
            let btd6apiSave = `${btd6api}save/${oak}`;
            let btd6apiUser = `${btd6api}users/${oak}`;
            let saveResponse = await axios.get(btd6apiSave);
            let userResponse = await axios.get(btd6apiUser);
            if (!userResponse.data.success || !saveResponse.data.success) {
                apiError = userResponse.data.error;
                break;
            };
            let saveData = saveResponse.data.body;
            let userData = userResponse.data.body;
            // General stats
            let userDescription = `Games Played: ${saveData.gamesPlayed}\nTotal EXP: ${saveData.xp + saveData.veteranXp}`;
            if (saveData.lifetimeTrophies > 0) userDescription += `\nTrophies Earned: ${saveData.lifetimeTrophies}`;
            if (saveData.lifetimeTeamTrophies > 0) userDescription += `\nTeam Trophies Earned: ${saveData.lifetimeTeamTrophies}`;
            // Rank string
            let rankString = `Level ${userData.rank}`;
            rankString += `\nVeteran Level: ${userData.veteranRank}`;
            // Hero and tower usage
            let heroesByUsageString = getUsageListString(userData.heroesPlaced);
            let towersByUsageString = getUsageListString(userData.towersPlaced);
            // Build user embed
            btd6Embed
                .setTitle(userData.displayName)
                .setAuthor({ name: rankString })
                .setDescription(userDescription)
                .setThumbnail(userData.avatarURL)
                .setImage(userData.bannerURL)
                .setFooter({ text: `User Profile Version: v${saveData.latestGameVersion}` })
                .addFields([
                    { name: "Heroes Placed:", value: heroesByUsageString, inline: true },
                    { name: "Towers Placed:", value: towersByUsageString, inline: true }
                ]);
            break;
    };
    // Handle API errors
    if (apiError) {
        btd6Embed
            .setTitle("Error")
            .setColor(globalVars.embedColorError)
            .setDescription(`The following error occurred while getting data from the API:${codeBlock(apiError)}Read more on the Ninja Kiwi API and Open Access Keys (OAKs) [here](<https://support.ninjakiwi.com/hc/en-us/articles/13438499873937-Open-Data-API>).`);
    };
    return sendMessage({ interaction: interaction, embeds: btd6Embed, ephemeral: ephemeral });
};

function getUsageListString(usageObject) {
    // Rosalia icon is missing
    let usageArray = Object.entries(usageObject).sort((a, b) => b[1] - a[1]);
    let usageString = "";
    usageArray.forEach(element => {
        if (heroIconsJSON[element[0]]) usageString += heroIconsJSON[element[0]];
        usageString += `${element[0]}: ${element[1]}\n`;
    });
    return usageString;
}

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
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("btd6")
    .setDescription("Shows BTD6 data.")
    .addSubcommand(userSubcommand);