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
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        await interaction.deferReply({ ephemeral: true });
        console.log('Deleting users...');
        const users = await user_api.getAllUsers();
        const pre_length = users.length;
        let counter = 0;
        await users.forEach(async user => {
            let member = await interaction.guild.members.fetch(user.user_id);
            if (!member || (!user.swcode && !user.birthday && (user.money < 100))) {
                counter +=1;
                await user_api.deleteUser(user.user_id);
            }
        })
        console.log(`Done ✔\nDeleted ${counter} out of ${pre_length} entries.`);
        return sendMessage({ client: client, interaction: interaction, content: 'Done' });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "clean",
    description: "Runs clean up routine of the database files",
    serverID: ["759344085420605471"]
};