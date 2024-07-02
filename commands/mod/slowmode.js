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

export default async (interaction, ephemeral) => {
    try {
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

    } catch (e) {
        logger({ exception: e, interaction: interaction });
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