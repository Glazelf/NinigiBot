import {
    PermissionFlagsBits,
    ChannelType,
    SlashCommandBuilder,
    SlashCommandIntegerOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isAdmin from "../../util/isAdmin.js";

const requiredPermission = PermissionFlagsBits.ManageChannels;

export default async (client, interaction, ephemeral) => {
    try {
        if (!interaction.inGuild()) return sendMessage({ client: client, interaction: interaction, content: globalVars.guildRequiredString });
        let adminBool = isAdmin(client, interaction.member);
        ephemeral = false;
        let slowmodeSupportedChannelTypes = [
            ChannelType.GuildText,
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.GuildStageVoice,
            ChannelType.GuildVoice
        ];
        if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPermsString });
        if (!slowmodeSupportedChannelTypes.includes(interaction.channel.type)) return sendMessage({ client: client, interaction: interaction, content: `This channel type doesn't support slowmode.` });

        let time = interaction.options.getInteger("time");
        await interaction.channel.setRateLimitPerUser(time);
        return sendMessage({ client: client, interaction: interaction, content: `Slowmode set to ${time} seconds.`, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

// Integer options
const timeOption = new SlashCommandIntegerOption()
    .setName("time")
    .setDescription("Time in seconds. 0 to disable.")
    .setRequired(true)
    .setMinValue(0)
    .setMaxValue(21600);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode in this channel.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(requiredPermission)
    .addIntegerOption(timeOption);