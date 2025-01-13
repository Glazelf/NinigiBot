import {
    MessageFlags,
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandBooleanOption,
    inlineCode
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isOwner from "../../util/discord/perms/isOwner.js";
import { getAllUsers } from "../../database/dbServices/user.api.js";

import globalVars from "../../objects/globalVars.json";

export default async (interaction: any, messageFlags: any) => {
    let confirm = false;
    let confirmArg = interaction.options.getBoolean("confirm");
    if (confirmArg === true) confirm = confirmArg;
    if (!confirm) return sendMessage({ interaction: interaction, content: `You are about to run an irreversible and expensive command.\nPlease set the ${inlineCode("confirm")} option for this command to ${inlineCode("true")} if you're sure.`, flags: messageFlags.add(MessageFlags.Ephemeral) });
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });

    messageFlags.remove(MessageFlags.Ephemeral);
    await interaction.deferReply({ flags: messageFlags });

    await sendMessage({ interaction: interaction, content: 'Deleting outdated entries...', flags: messageFlags });
    const users = await getAllUsers();
    if (users.length == 0) return sendMessage({ interaction: interaction, content: 'Database is already empty!', flags: messageFlags });
    let server_users = await interaction.guild.members.fetch();
    server_users = server_users.map((user: any) => user.id);
    const pre_length = users.length;
    const deleted_users: any = [];
    let checkedUsers: any = [];
    // Check duplicate user_id
    await users.forEach((user: any) => {
        if (checkedUsers.includes(user.user_id)) deleted_users.push(user);
        checkedUsers.push(user.user_id);
    });
    // Check random stuff ??
    await users.forEach((user: any) => {
        if (!server_users.includes(user.user_id) || ((!user.swcode) && (!user.birthday) && (user.money < 100))) {
            deleted_users.push(user.user_id);
        };
    });
    // @ts-expect-error TS(2588): Cannot assign to 'deleted_users' because it is a c... Remove this comment to see the full error message
    deleted_users = [...new Set(deleted_users)];
    if (deleted_users.length == 0) return sendMessage({ interaction: interaction, content: 'Database is already clean!', flags: messageFlags });
    // @ts-expect-error TS(2304): Cannot find name 'user_api'.
    await user_api.bulkDeleteUsers(deleted_users);
    return sendMessage({ interaction: interaction, content: `Done ✔\nDeleted ${deleted_users.length} out of ${pre_length} entries.`, flags: messageFlags });
};

export const guildID = process.env.DEV_SERVER_ID;

// Boolea options
const confirmOption = new SlashCommandBooleanOption()
    .setName("confirm")
    .setDescription("Are you sure? This is an irreversible and expensive command.");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("clean")
    .setDescription("Runs clean up routine of the database files.")
    .setContexts([InteractionContextType.Guild])
    .addBooleanOption(confirmOption);