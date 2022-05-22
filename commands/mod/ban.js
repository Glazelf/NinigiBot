exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');
        let adminBool = await isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has("BAN_MEMBERS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let user = null;
        let member = null;
        let userArg = args.find(element => element.name == "user");
        if (userArg) {
            user = userArg.user;
            member = await interaction.guild.members.fetch(user.id);
        };
        let userIDArg = args.find(element => element.name == "user-id");
        let author = interaction.user;

        let reason = "Not specified.";
        let reasonArg = args.find(element => element.name == "reason");
        if (reasonArg) reason = reasonArg.value;

        let banReturn = null;
        let banFailString = `Ban failed. Either the specified user isn't in the server or I lack banning permissions.`;

        let dmString = `You've been banned from **${interaction.guild.name}** for the following reason: \`${reason}\``;

        let bansFetch;
        try {
            bansFetch = await interaction.guild.bans.fetch();
        } catch (e) {
            // console.log(e);
            bansFetch = null;
        };

        let time = await getTime(client);
        let reasonInfo = `-${interaction.user.tag} (${time})`;

        // If user is found
        if (member) {
            // Check permissions
            let userRole = interaction.member.roles.highest;
            let targetRole = member.roles.highest;
            if (targetRole.position >= userRole.position && interaction.guild.ownerId !== interaction.user.id) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to ban **${member.user.tag}** (${member.id}).` });
            if (!member.bannable) return sendMessage({ client: client, interaction: interaction, content: banFailString });

            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(member.id)) return sendMessage({ client: client, interaction: interaction, content: `**${member.user.tag}** (${member.id}) is already banned.` });
            };

            // Ban
            banReturn = `Successfully banned **${member.user.tag}** (${member.id}) for the following reason: \`${reason}\`.`;

            try {
                try {
                    await user.send({ content: dmString });
                    banReturn += " (DM Succeeded)";
                } catch (e) {
                    // console.log(e);
                    banReturn += " (DM Failed)";
                };

                await member.ban({ days: 0, reason: `${reason} ${reasonInfo}` });
                return sendMessage({ client: client, interaction: interaction, content: banReturn, ephemeral: false });
            } catch (e) {
                // console.log(e);
                return sendMessage({ client: client, interaction: interaction, content: banFailString });
            };

            // If user isn't found, try to ban by ID
        } else {
            if (!userIDArg) return sendMessage({ client: client, interaction: interaction, content: `You need to provide a user to ban.` });
            let memberID = userIDArg.value;

            // See if target isn't already banned
            if (bansFetch) {
                if (bansFetch.has(memberID)) return sendMessage({ client: client, interaction: interaction, content: `<@${memberID}> (${memberID}) is already banned.` });
            };

            banReturn = `Successfully banned <@${memberID}> (${memberID}) for the following reason: \`${reason}\`.`;

            // Ban
            try {
                await interaction.guild.members.ban(memberID, { days: 0, reason: `${reason} ${reasonInfo}` });
                return sendMessage({ client: client, interaction: interaction, content: banReturn, ephemeral: false });
            } catch (e) {
                // console.log(e);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    return sendMessage({ client: client, interaction: interaction, content: banFailString });
                };
            };
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "ban",
    description: "Bans target user.",
    options: [{
        name: "user",
        type: "USER",
        description: "User to ban.",
    }, {
        name: "reason",
        type: "STRING",
        description: "Reason for ban."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Ban user by ID.",
    }]
};