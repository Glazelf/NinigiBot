import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isAdmin from "../../util/isAdmin.js";

export default async (client, interaction, ephemeral) => {
    try {
        let adminBool = isAdmin(client, interaction.member);
        ephemeral = false;
        let slowmodeSupportedChannelTypes = [
            Discord.ChannelType.GuildText,
            Discord.ChannelType.PublicThread,
            Discord.ChannelType.PrivateThread,
            Discord.ChannelType.GuildStageVoice,
            Discord.ChannelType.GuildVoice
        ];
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels) && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });
        if (!slowmodeSupportedChannelTypes.includes(interaction.channel.type)) return sendMessage({ client: client, interaction: interaction, content: `This channel type doesn't support slowmode.` });

        let time = interaction.options.getInteger("time");
        await interaction.channel.setRateLimitPerUser(time);
        return sendMessage({ client: client, interaction: interaction, content: `Slowmode set to ${time} seconds.`, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "slowmode",
    description: "Set slowmode in the current channel.",
    options: [{
        name: "time",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Time in seconds. 0 to disable.",
        required: true,
        minValue: 0,
        maxValue: 21600
    }]
};