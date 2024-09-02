import {
    InteractionContextType,
    PermissionFlagsBits,
    ChannelType,
    SlashCommandBuilder,
    SlashCommandIntegerOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isAdmin from "../../util/perms/isAdmin.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const requiredPermission = PermissionFlagsBits.ManageChannels;

export default async (interaction, ephemeral) => {
    let adminBool = isAdmin(interaction.member);
    ephemeral = false;
    let slowmodeSupportedChannelTypes = [
        ChannelType.GuildText,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.GuildStageVoice,
        ChannelType.GuildVoice
    ];
    if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });
    if (!slowmodeSupportedChannelTypes.includes(interaction.channel.type)) return sendMessage({ interaction: interaction, content: `This channel type doesn't support slowmode.` });

    let time = interaction.options.getInteger("time");
    await interaction.channel.setRateLimitPerUser(time);
    return sendMessage({ interaction: interaction, content: `Slowmode set to ${time} seconds.`, ephemeral: ephemeral });
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
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(requiredPermission)
    .addIntegerOption(timeOption);