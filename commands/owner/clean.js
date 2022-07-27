exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const isOwner = require('../../util/isOwner');
        const getTime = require('../../util/getTime');
        const user_api = require('../../database/dbServices/user.api');
        let confirm = false
        let confirmArg = interaction.options.getBoolean("confirm");
        if (confirmArg === true) confirm = confirmArg;
        if (!confirm) return sendMessage({ client: client, interaction: interaction, content: `This action is an irreversible and expensive command.\nPlease set the \`confirm\` option for this command to \`true\` if you're sure.` });
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        await interaction.deferReply({ ephemeral: true });
        console.log('Deleting users...');
        await sendMessage({ client: client, interaction: interaction, content: 'Deleting outdated entries...' });
        const users = await user_api.getAllUsers();
        let server_users = await interaction.guild.members.fetch();
        server_users = server_users.map(user=> user.id);
        const pre_length = users.length;
        const deleted_users = []
        users.forEach(user => {
            if (!server_users.includes(user.id) || (!user.swcode && !user.birthday && (user.money < 100))) {
                deleted_users.push(user.id);
            }
        })
        await user_api.bulkDeleteUsers(deleted_users);
        console.log(`Done ✔\nDeleted ${deleted_users.length} out of ${pre_length} entries.`);
        return sendMessage({ client: client, interaction: interaction, content: `Done ✔\nDeleted ${deleted_users.length} out of ${pre_length} entries.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "clean",
    description: "Runs clean up routine of the database files",
    serverID: ["759344085420605471"],
    options: [{
        name: "confirm",
        type: "BOOLEAN",
        description: "Are you sure? This is an irreversible and expensive command."
    }]
};