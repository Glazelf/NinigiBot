import {
    EmbedBuilder,
    SlashCommandBooleanOption,
    SlashCommandBuilder
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import { getUsersRankedByMoney } from "../../database/dbServices/user.api.js";

export default async (client, interaction, ephemeral) => {
    try {
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
            let leaderboardStringGlobal = money_db.filter(user => client.users.cache.has(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .slice(0, 10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${globalVars.currency}`)
                .join('\n');
            leaderboardEmbed
                .setDescription(leaderboardStringGlobal)
                .setTitle(`Global Leaderboard:`);
        } else {
            // Server leaderboard
            let icon = interaction.guild.iconURL(globalVars.displayAvatarSettings);
            let leaderboardString = money_db.filter(user => client.users.cache.get(user.user_id) && memberFetch.get(user.user_id))
                .filter(user => !client.users.cache.get(user.user_id).bot)
                .slice(0, 10)
                .map((user, position) => `${position + 1}. ${(client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${globalVars.currency}`)
                .join('\n');
            if (leaderboardString.length < 1) return sendMessage({ client: client, interaction: interaction, content: "Noone in this server has any currency yet." });
            leaderboardEmbed
                .setDescription(leaderboardString)
                .setTitle(`Leaderboard:`)
                .setThumbnail(icon);
        };
        return sendMessage({ client: client, interaction: interaction, embeds: leaderboardEmbed, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
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