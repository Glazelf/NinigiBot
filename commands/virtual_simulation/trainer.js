import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandBooleanOption,
    ApplicationIntegrationType
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import { getUser } from "../../database/dbServices/user.api.js";
import { getShinx } from "../../database/dbServices/shinx.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    let embed = new EmbedBuilder();
    switch (interaction.options.getSubcommand()) {
        case "info":
            let user = await getUser(interaction.user.id);
            let avatar = interaction.user.displayAvatarURL(globalVars.displayAvatarSettings);
            if (interaction.inGuild() && interaction.member && Object.keys(interaction.authorizingIntegrationOwners).includes(ApplicationIntegrationType.GuildInstall.toString())) {
                avatar = interaction.member.displayAvatarURL(globalVars.displayAvatarSettings);
            };

            let trophy_level = 0;
            let trophies = await user.getShopTrophies();
            let trophy_string = '';
            trophies.forEach(trophy => {
                trophy_string += (trophy.icon + ' ');
            });
            trophy_level += trophies.length;
            trophies = await user.getEventTrophies();

            trophies.forEach(trophy => {
                trophy_string += (trophy.icon + ' ');
            });
            trophy_level += trophies.length;

            embed
                .setColor(globalVars.embedColor)
                .setThumbnail(avatar)
                .addFields([
                    { name: "Balance:", value: user.money.toString(), inline: true },
                    { name: "Food:", value: user.food.toString(), inline: true }
                ]);
            if (trophy_string.length > 0) {
                embed.addFields([
                    { name: "Trophy Level:", value: trophy_level + " 🔰", inline: true },
                    { name: "Trophies:", value: trophy_string, inline: true }
                ]);
            };
            return sendMessage({ interaction: interaction, embeds: [embed], ephemeral: ephemeral });
        case "swapsprite":
            const shinx = await getShinx(interaction.user.id);
            return sendMessage({ interaction: interaction, content: `Your character is now ${shinx.swapAndGetTrainerGender() ? 'male' : 'female'}, ${interaction.user}!` });
    };
};

// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const infoOption = new SlashCommandSubcommandBuilder()
    .setName("info")
    .setDescription("Check your trainer stats.")
    .addBooleanOption(ephemeralOption);
const swapSpriteOption = new SlashCommandSubcommandBuilder()
    .setName("swapsprite")
    .setDescription("Swap your trainer sprite between Dawn and Lucas.");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("trainer")
    .setDescription("Check and edit your trainer.")
    .addSubcommand(infoOption)
    .addSubcommand(swapSpriteOption);