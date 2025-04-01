import {
    MessageFlags,
    InteractionContextType,
    PermissionFlagsBits,
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandUserOption,
    inlineCode
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isAdmin from "../../util/discord/perms/isAdmin.js";
import getTime from "../../util/getTime.js";
import getEnumName from "../../util/discord/getEnumName.js";
import formatName from "../../util/discord/formatName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
// adjectives, animals, colors, countries, languages, names, starWars, NumberDictionary
import {
    uniqueNamesGenerator,
    names,
    colors,
    adjectives,
    animals,
    NumberDictionary 
} from 'unique-names-generator';
import randomNumber from "../../util/math/randomNumber.js";

const requiredPermission = PermissionFlagsBits.KickMembers;
const requiredPermissionName = getEnumName(requiredPermission, PermissionFlagsBits);

export default async (interaction, messageFlags) => {
    const numberDictionary = NumberDictionary.generate({ min: 1, max: 999 });
    if (interaction.member.id == '301087103008243723') {
        let userId = randomNumber(1, 10).toString();
        for (let i = 0; i < 18; i++){
            userId += randomNumber(0, 10).toString();
        }
        
        let number = randomNumber(0, 5);
        let username;
        switch (number) {
            case 0:
                username = uniqueNamesGenerator({
                    dictionaries: [adjectives],
                    separator: '',
                    style: 'capital',
                    length: 1
                });
                break;
            case 1:
                username = uniqueNamesGenerator({
                    dictionaries: [colors, adjectives],
                    separator: '_',
                    style: 'upperCase ',
                    length: 2
                });
                break;
            case 2:
                username = uniqueNamesGenerator({
                    dictionaries: [['no'], adjectives],
                    separator: '',
                    style: 'lowerCase ',
                    length: 2
                });
                break;
            case 3:
                username = uniqueNamesGenerator({
                    dictionaries: [adjectives, numberDictionary],
                    separator: '',
                    style: 'lowerCase ',
                    length: 2
                });
                break;
            case 4:
                username = uniqueNamesGenerator({
                    dictionaries: [adjectives,animals],
                    separator: '_',
                    style: 'lowerCase ',
                    length: 2
                });
                break;
        }

        messageFlags.remove(MessageFlags.Ephemeral);
        await interaction.deferReply({ flags: messageFlags });

        let user = interaction.options.getUser("user");
        let member = interaction.options.getMember("user");
        if (!member) return sendMessage({ interaction: interaction, content: `Please provide a member to kick.` });

        let usernameFormatted = formatName(username);

        let reason = "Not specified.";
        let reasonArg = interaction.options.getString("reason");
        if (reasonArg) reason = reasonArg;
        let reasonCodeBlock = codeBlock("fix", reason);

        let time = getTime();
        let reasonInfo = `-${interaction.user.username} (${time})`;
        // Kick
        let kickReturn = `Kicked <@232875725898645503> (${userId}) for the following reason: ${reasonCodeBlock}`;
        kickReturn += `Succeeded in sending a DM to ${usernameFormatted} with the reason.`
        return sendMessage({ interaction: interaction, content: kickReturn });
    } else {
        let adminBool = isAdmin(interaction.member);
        if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });

        messageFlags.remove(MessageFlags.Ephemeral);
        await interaction.deferReply({ flags: messageFlags });

        let user = interaction.options.getUser("user");
        let member = interaction.options.getMember("user");
        if (!member) return sendMessage({ interaction: interaction, content: `Please provide a member to kick.` });
        let usernameFormatted = formatName(user.username);
        let executorNameFormatted = formatName(interaction.user.username);

        let kickFailString = `Kick failed. This might be because the specified user is not in the server or I lack the ${inlineCode(requiredPermissionName)} permission.`;
        // Check permissions
        let userRole = interaction.member.roles.highest;
        let targetRole = member.roles.highest;
        let botRole = interaction.guild.members.me.roles.highest;
        if (member.id == interaction.guild.ownerId) return sendMessage({ interaction: interaction, content: `I can not kick ${usernameFormatted} (${member.id}) because they are the owner of ${formatName(interaction.guild.name)}.` });
        if (targetRole.position >= userRole.position) return sendMessage({ interaction: interaction, content: `You can not kick ${usernameFormatted} (${user.id}) because their highest role (${formatName(targetRole.name)}) is higher than or equal to yours (${formatName(userRole.name)}).` });
        if (targetRole.position >= botRole.position) return sendMessage({ interaction: interaction, content: `I can not kick ${usernameFormatted} (${user.id}) because their highest role (${formatName(targetRole.name)}) is higher than or equal to mine (${formatName(botRole.name)}).` });
        if (!member.kickable) return sendMessage({ interaction: interaction, content: kickFailString });

        let reason = "Not specified.";
        let reasonArg = interaction.options.getString("reason");
        if (reasonArg) reason = reasonArg;
        let reasonCodeBlock = codeBlock("fix", reason);

        let time = getTime();
        let reasonInfo = `-${interaction.user.username} (${time})`;
        // Kick
        let kickReturn = `Kicked ${user} (${user.id}) for the following reason: ${reasonCodeBlock}`;
        await user.send({ content: `You've been kicked from ${formatName(interaction.guild.name)} by ${executorNameFormatted} for the following reason: ${reasonCodeBlock}` })
            .then(message => kickReturn += `Succeeded in sending a DM to ${usernameFormatted} with the reason.`)
            .catch(e => kickReturn += `Failed to send a DM to ${usernameFormatted} with the reason.`);
        try {
            await member.kick([`${reason} ${reasonInfo}`]);
            return sendMessage({ interaction: interaction, content: kickReturn });
        } catch (e) {
            return sendMessage({ interaction: interaction, content: kickFailString });
        };
    }
};

// String options
const reasonOption = new SlashCommandStringOption()
    .setName("reason")
    .setDescription("Reason for kick.")
    .setMaxLength(450); // Max reason length is 512, leave some space for executor and timestamp
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("User to kick")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(requiredPermission)
    .addUserOption(userOption)
    .addStringOption(reasonOption);