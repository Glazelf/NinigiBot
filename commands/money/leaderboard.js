import {
    EmbedBuilder,
    SlashCommandBooleanOption,
    SlashCommandBuilder
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import { getUsersRankedByMoney } from "../../database/dbServices/user.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });

    let memberFetch = await interaction.guild.members.fetch();
    let global = false;
    let globalArg = interaction.options.getBoolean("global");
    if (globalArg === true) global = globalArg;
    const money_db = await getUsersRankedByMoney();
    const leaderboardEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    if (global) {
        // Global leaderboard
        let leaderboardStringGlobal = money_db.filter(user => interaction.client.users.cache.has(user.user_id))
            .filter(user => !interaction.client.users.cache.get(user.user_id).bot)
            .slice(0, 10)
            .map((user, position) => `${position + 1}. ${(interaction.client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${globalVars.currency}`)
            .join('\n');
        leaderboardEmbed
            .setDescription(leaderboardStringGlobal)
            .setTitle(`Global Leaderboard:`);
    } else {
        // Server leaderboard
        let icon = interaction.guild.iconURL(globalVars.displayAvatarSettings);
        let leaderboardString = money_db.filter(user => interaction.client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
            .filter(user => !interaction.client.users.cache.get(user.user_id).bot)
            .slice(0, 10)
            .map((user, position) => `${position + 1}. ${(interaction.client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${globalVars.currency}`)
            .join('\n');
        if (leaderboardString.length < 1) return sendMessage({ interaction: interaction, content: "Noone in this server has any currency yet." });
        leaderboardEmbed
            .setDescription(leaderboardString)
            .setTitle(`Leaderboard:`)
            .setThumbnail(icon);
    };
    return sendMessage({ interaction: interaction, embeds: leaderboardEmbed, ephemeral: ephemeral });
};

// Boolean options
const globalOption = new SlashCommandBooleanOption()
    .setName("global")
    .setDescription("Whether to show global leaderboard.");
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Displays money leaderboard.")
    .setDMPermission(false)
    .addBooleanOption(globalOption)
    .addBooleanOption(ephemeralOption);