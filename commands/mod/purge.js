import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandUserOption,
    bold
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isAdmin from "../../util/perms/isAdmin.js";
import getPermissionName from "../../util/discord/getPermissionName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const requiredPermission = PermissionFlagsBits.ManageMessages;
const requiredPermissionName = getPermissionName(requiredPermission);

export default async (interaction, ephemeral) => {
    let adminBool = isAdmin(interaction.member);
    if (!interaction.member.permissions.has(requiredPermission) && !adminBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });

    let returnString = "";
    let amount = interaction.options.getInteger("amount");
    // Get users
    let user = null;
    let userArg = interaction.options.getUser("user");
    if (userArg) user = userArg;

    let deleteFailString = `An error occurred while bulk deleting. I probably lack the \`${requiredPermissionName}\` permission.`;
    let missingMessagesString = `\nSome messages were not deleted, probably because they were older than 2 weeks.`;
    // Fetch 100 messages (will be filtered and lowered up to max amount requested), delete them and catch errors
    if (user) {
        try {
            let messagesAll = await interaction.channel.messages.fetch({ limit: amount });
            let messagesFiltered = await messagesAll.filter(m => m.author.id == user.id);
            let messages = Object.values(Object.fromEntries(messagesFiltered)).slice(0, amount);
            await interaction.channel.bulkDelete(messages, [true])
                .then(messagesDeleted => {
                    returnString = `Deleted ${messagesDeleted.size} messages from ${bold(user.username)} within the last ${amount} messages.`;
                    if (messagesDeleted.size < amount) returnString += missingMessagesString;
                    sendMessage({ interaction: interaction, content: returnString });
                });
            return;
        } catch (e) {
            // console.log(e);
            return sendMessage({ interaction: interaction, content: deleteFailString });
        };
    } else {
        try {
            let messages = await interaction.channel.messages.fetch({ limit: amount });
            await interaction.channel.bulkDelete(messages, [true])
                .then(messagesDeleted => {
                    returnString = `Deleted ${messagesDeleted.size} messages.`;
                    if (messagesDeleted.size < amount) returnString += missingMessagesString;
                    sendMessage({ interaction: interaction, content: returnString });
                });
            return;
        } catch (e) {
            // console.log(e);
            return interaction.channel.send({ content: deleteFailString });
        };
    };
};

// Integer options
const amountOption = new SlashCommandIntegerOption()
    .setName("amount")
    .setDescription("The amount of messages to delete.")
    .setMinValue(1)
    .setMaxValue(100)
    .setRequired(true);
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("Specific user to delete messages from.");
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk delete messages.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(requiredPermission)
    .addIntegerOption(amountOption)
    .addUserOption(userOption)
    .addBooleanOption(ephemeralOption);