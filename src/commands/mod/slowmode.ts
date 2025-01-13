import {
    MessageFlags,
    InteractionContextType,
    PermissionFlagsBits,
    ChannelType,
    SlashCommandBuilder,
    SlashCommandIntegerOption
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isAdmin from "../../util/discord/perms/isAdmin.js";

import globalVars from "../../objects/globalVars.json";

const requiredPermission = PermissionFlagsBits.ManageChannels;

export default async (interaction: any, messageFlags: any) => {
    messageFlags.remove(MessageFlags.Ephemeral);
    let adminBool = isAdmin(interaction.member);
    let slowmodeSupportedChannelTypes = [
        ChannelType.GuildText,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.GuildStageVoice,
        ChannelType.GuildVoice
    ];
    if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });
    if (!slowmodeSupportedChannelTypes.includes(interaction.channel.type)) return sendMessage({ interaction: interaction, content: `This channel type doesn't support slowmode.`, flags: messageFlags.add(MessageFlags.Ephemeral) });

    let time = interaction.options.getInteger("time");
    await interaction.channel.setRateLimitPerUser(time);
    return sendMessage({ interaction: interaction, content: `Slowmode set to ${time} seconds.`, flags: messageFlags });
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