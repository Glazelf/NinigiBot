import {
    PermissionFlagsBits,
    ChannelType,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isAdmin from "../../util/perms/isAdmin.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import textChannelTypes from "../../objects/discord/textChannelTypes.json" with { type: "json" };

const requiredPermission = PermissionFlagsBits.ManageGuild;

export default async (interaction) => {
    let adminBool = isAdmin(interaction.member);
    if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });
    let ephemeral = true;
    await interaction.deferReply({ ephemeral: ephemeral });

    let serverApi = await import("../../database/dbServices/server.api.js");
    serverApi = await serverApi.default();

    let disableBool = false;
    let disableArg = interaction.options.getBoolean("disable");
    if (disableArg === true) disableBool = disableArg;
    let channelArg = interaction.options.getChannel("channel");
    let textChannelInvalidString = null;
    if (channelArg) textChannelInvalidString = `No text can be sent to ${channelArg}'s type (${ChannelType[channelArg.type]}) of channel. Please select a text channel.`;
    let disableString = `Disabled ${interaction.options.getSubcommand()} functionality in **${interaction.guild.name}**.`;
    let argRequiredString = "At least one argument is required for this command.";
    switch (interaction.options.getSubcommand()) {
        case "starboard":
            let starlimitArg = interaction.options.getInteger("starlimit");
            if (starlimitArg && !channelArg) return sendMessage({ interaction: interaction, content: "Can not set starlimit without also providing a channel." });
            if (!channelArg && !disableArg && !starlimitArg) return sendMessage({ interaction: interaction, content: argRequiredString });
            let oldStarboardChannel = await serverApi.StarboardChannels.findOne({ where: { server_id: interaction.guild.id } });
            let oldStarLimitDB = await serverApi.StarboardLimits.findOne({ where: { server_id: interaction.guild.id } });
            let starlimit = globalVars.starboardLimit;
            if (oldStarLimitDB) starlimit = oldStarLimitDB.star_limit;
            if (channelArg && !Object.values(textChannelTypes).includes(channelArg.type)) return sendMessage({ interaction: interaction, content: textChannelInvalidString })

            if (starlimitArg) {
                starlimit = starlimitArg;
                if (oldStarLimitDB) await oldStarLimitDB.destroy();
                await serverApi.StarboardLimits.upsert({ server_id: interaction.guild.id, star_limit: starlimit });
            };
            // Database
            if (oldStarboardChannel) await oldStarboardChannel.destroy();
            if (disableBool) return sendMessage({ interaction: interaction, content: disableString });
            await serverApi.StarboardChannels.upsert({ server_id: interaction.guild.id, channel_id: channelArg.id });
            return sendMessage({ interaction: interaction, content: `${channelArg} is now **${interaction.guild.name}**'s starboard. ${starlimit} stars are now required for a message to appear on the starboard.` });
        case "log":
            if (!channelArg && !disableArg) return sendMessage({ interaction: interaction, content: argRequiredString });
            let oldLogChannel = await serverApi.LogChannels.findOne({ where: { server_id: interaction.guild.id } });
            if (channelArg && !Object.values(textChannelTypes).includes(channelArg.type)) return sendMessage({ interaction: interaction, content: textChannelInvalidString })
            if (oldLogChannel) await oldLogChannel.destroy();
            if (disableBool) return sendMessage({ interaction: interaction, content: disableString });
            await serverApi.LogChannels.upsert({ server_id: interaction.guild.id, channel_id: channelArg.id });
            return sendMessage({ interaction: interaction, content: `Logging has been added to ${channelArg}.` });
        case "automod":
            let scamKeywords = [
                "http.?:\/\/(dicsord-nitro|discrod-egifts|steamnitro|discordgift|discordc|discorcl|dizcord|dicsord|dlscord|dlcsorcl|dlisocrd|djscord-airdrops).(com|org|ru|click|gift|net)",// Discord gift links
                // "http.?:\/\/.*\.ru", // Russian websites, should fix, re-add and enable this for any servers that aren't russian when language is done. Currently matches any URL containing "ru" after a period. Can't seem to replicate this on online regex testers though
                "http.?:\/\/gidthub.com"
            ];
            let advertisementKeywords = [
                "discord.gg",
                "bit.ly",
                "twitch.tv"
            ];
            // There should be a builder for this? but couldn't get this to work: https://discord.js.org/docs/packages/discord.js/14.14.1/AutoModerationRule:Class
            // let autoModObject = new AutoModerationRule()
            let autoModObject = {
                name: `Ninigi AutoMod`,
                enabled: true,
                eventType: 1,
                triggerType: 1,
                triggerMetadata:
                {
                    regexPatterns: scamKeywords
                },
                actions: [
                    {
                        type: 1,
                        metadata: {
                            customMessage: `Blocked by ${interaction.client.user.username} AutoMod rule.`,
                            channel: channelArg.id
                        }
                    },
                    {
                        type: 2,
                        metadata: {
                            channel: channelArg.id
                        }
                    },
                    {
                        type: 3,
                        metadata: {
                            durationSeconds: 3600 // 1 hour
                        }
                    }
                ],
                reason: `Requested by ${interaction.user.username}.`
            };
            if (interaction.options.getBoolean("advertisement")) autoModObject.triggerMetadata.keywordFilter = advertisementKeywords;
            try {
                await interaction.guild.autoModerationRules.create(autoModObject);
            } catch (e) {
                // console.log(e);
                return sendMessage({ interaction: interaction, content: `Failed to add AutoMod rule. Make sure **${interaction.guild.name}** does not already have the maximum amount of AutoMod rules.` });
            }
            return sendMessage({ interaction: interaction, content: `AutoMod rules added to **${interaction.guild.name}**.\nAutoMod notiications will be sent to ${channelArg}.` });
        case "personalroles":
            let personalRolesServerID = await serverApi.PersonalRoleServers.findOne({ where: { server_id: interaction.guild.id } });
            // Database
            if (personalRolesServerID) {
                await personalRolesServerID.destroy();
                return sendMessage({ interaction: interaction, content: `Personal roles can no longer be managed by users in **${interaction.guild.name}**.` });
            } else {
                await serverApi.PersonalRoleServers.upsert({ server_id: interaction.guild.id });
                return sendMessage({ interaction: interaction, content: `Personal roles can now be managed by users in **${interaction.guild.name}**.` });
            };
    };
};

// Integer options
const starLimitOption = new SlashCommandIntegerOption()
    .setName("starlimit")
    .setDescription("Required amount of stars on a message.")
    .setMinValue(1);
// Channel options
const channelOption = new SlashCommandChannelOption()
    .setName("channel")
    .setDescription("Specify channel.");
const channelAutoModOption = new SlashCommandChannelOption()
    .setName("channel")
    .setDescription("Specify channel to log alerts to.")
    .setRequired(true);
// Boolean options
const disableOption = new SlashCommandBooleanOption()
    .setName("disable")
    .setDescription("Disable this feature.");
const advertisementOption = new SlashCommandBooleanOption()
    .setName("advertisement")
    .setDescription("Enable anti-advertisement keywords.");
// Subcommands
const starboardSubcommand = new SlashCommandSubcommandBuilder()
    .setName("starboard")
    .setDescription("Set a starboard channel.")
    .addChannelOption(channelOption)
    .addIntegerOption(starLimitOption)
    .addBooleanOption(disableOption);
const logSubcommand = new SlashCommandSubcommandBuilder()
    .setName("log")
    .setDescription("Choose a channel to log events to.")
    .addChannelOption(channelOption)
    .addBooleanOption(disableOption);
const autoModSubcommand = new SlashCommandSubcommandBuilder()
    .setName("automod")
    .setDescription("Add bot's AutoMod rules to this server.")
    .addChannelOption(channelAutoModOption)
    .addBooleanOption(advertisementOption)
const personalRolesSubcommand = new SlashCommandSubcommandBuilder()
    .setName("personalroles")
    .setDescription("Toggle personal roles in this server.");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("serversettings")
    .setDescription("Change server settings")
    .setDMPermission(false)
    .setDefaultMemberPermissions(requiredPermission)
    .addSubcommand(starboardSubcommand)
    .addSubcommand(logSubcommand)
    .addSubcommand(autoModSubcommand)
    .addSubcommand(personalRolesSubcommand);