import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isOwner from "../../util/isOwner.js";
import { getAllUsers } from "../../database/dbServices/user.api.js";

export default async (client, interaction, ephemeral) => {
    try {
        ephemeral = true;
        let confirm = false;
        let confirmArg = interaction.options.getBoolean("confirm");
        if (confirmArg === true) confirm = confirmArg;
        if (!confirm) return sendMessage({ client: client, interaction: interaction, content: `You are about to run an irreversible and expensive command.\nPlease set the \`confirm\` option for this command to \`true\` if you're sure.`, ephemeral: true });
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        await interaction.deferReply({ ephemeral: ephemeral });
        await sendMessage({ client: client, interaction: interaction, content: 'Deleting outdated entries...' });
        const users = await getAllUsers();
        if (users.length == 0) return sendMessage({ client: client, interaction: interaction, content: 'Database is already empty!' });
        let server_users = await interaction.guild.members.fetch();
        server_users = server_users.map(user => user.id);
        const pre_length = users.length;
        const deleted_users = [];
        let checkedUsers = [];
        // Check duplicate user_id
        await users.forEach(user => {
            if (checkedUsers.includes(user.user_id)) deleted_users.push(user);
            checkedUsers.push(user.user_id);
        });
        // Check random stuff ??
        await users.forEach(user => {
            if (!server_users.includes(user.user_id) || ((!user.swcode) && (!user.birthday) && (user.money < 100))) {
                deleted_users.push(user.user_id);
            };
        });
        deleted_users = [...new Set(deleted_users)];
        if (deleted_users.length == 0) return sendMessage({ client: client, interaction: interaction, content: 'Database is already clean!' });
        await user_api.bulkDeleteUsers(deleted_users);
        return sendMessage({ client: client, interaction: interaction, content: `Done ✔\nDeleted ${deleted_users.length} out of ${pre_length} entries.` });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "clean",
    description: "Runs clean up routine of the database files",
    serverID: ["759344085420605471"],
    options: [{
        name: "confirm",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Are you sure? This is an irreversible and expensive command."
    }]
};