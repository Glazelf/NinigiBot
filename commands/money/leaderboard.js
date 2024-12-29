import {
    MessageFlags,
    EmbedBuilder,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isGuildDataAvailable from "../../util/discord/isGuildDataAvailable.js";
import { getUsersRankedByMoney } from "../../database/dbServices/user.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, messageFlags) => {
    await interaction.deferReply({ ephemeral: messageFlags.has(MessageFlags.Ephemeral) });

    const money_db = await getUsersRankedByMoney();
    const leaderboardEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    let scopeInput = interaction.options.getString("scope");
    let scope = scopeInput;
    if (!scopeInput || !isGuildDataAvailable(interaction)) scope = "global";
    console.log(scope)
    switch (scope) {
        case "global":
            // Global leaderboard
            let leaderboardStringGlobal = money_db.filter(user => interaction.client.users.cache.has(user.user_id))
                .filter(user => !interaction.client.users.cache.get(user.user_id).bot)
                .slice(0, 10)
                .map((user, position) => `${position + 1}. ${(interaction.client.users.cache.get(user.user_id).username)}: ${Math.floor(user.money)}${globalVars.currency}`)
                .join('\n');
            leaderboardEmbed
                .setDescription(leaderboardStringGlobal)
                .setTitle(`Global Leaderboard:`);
            if (scopeInput == "guild") leaderboardEmbed.setFooter({ text: "Server leaderboard can only be displayed if this comamnd is used in a server that I am in." });
            break;
        case "guild":
            // Server leaderboard
            let memberFetch = await interaction.guild.members.fetch();
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
            break;
    };
    return sendMessage({ interaction: interaction, embeds: leaderboardEmbed, flags: messageFlags });
};

const leaderboardScopeChoices = [
    { name: "This server only", value: "guild" },
    { name: "Global", value: "global" },
];

// Boolean options
const scopeOption = new SlashCommandStringOption()
    .setName("scope")
    .setDescription("Choose the scope of the leaderboard.")
    .setChoices(leaderboardScopeChoices)
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Displays currency leaderboard.")
    .addStringOption(scopeOption)
    .addBooleanOption(ephemeralOption);