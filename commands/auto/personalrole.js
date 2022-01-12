exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { PersonalRoles, PersonalRoleServers } = require('../../database/dbObjects');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, interaction.member);
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: interaction.guild.id } });
        if (!serverID) return sendMessage({ client: client, interaction: interaction, content: `Personal Roles are disabled in **${interaction.guild.name}**.` });

        let roleDB = await PersonalRoles.findOne({ where: { server_id: interaction.guild.id, user_id: interaction.member.id } });

        // Check if icons are possible
        let iconsAllowed = false;
        let nitroLevel2Req = 7;
        if (interaction.guild.premiumSubscriptionCount > nitroLevel2Req || interaction.guild.verified || interaction.guild.partnered) iconsAllowed = true;

        // Get Nitro Booster position
        let boosterRole = await interaction.guild.roles.premiumSubscriberRole;
        if (!boosterRole) return sendMessage({ client: client, interaction: interaction, content: `**${interaction.guild}** does not have a Nitro Boost role. This role is created the first time someone boosts a server.` });
        let personalRolePosition = boosterRole.position + 1;

        if (!interaction.member.roles.cache.has(boosterRole.id) && !interaction.member.permissions.has("MANAGE_ROLES") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: `You need to be a Nitro Booster or moderator to manage a personal role.` });

        // Custom role position for mods opens up a can of permission exploits where mods can mod eachother based on personal role order
        // if (interaction.member.roles.cache.has(modRole.id)) personalRolePosition = modRole.position + 1;

        if (interaction.guild.me.roles.highest.position <= personalRolePosition) return sendMessage({ client: client, interaction: interaction, content: `My highest role isn't above your personal role or the Nitro Boost role so I can't edit your personal role.` });

        // Color catch
        let colorArgument = args.find(element => element.name == 'color-hex');
        let roleColor = null;
        if (colorArgument) roleColor = colorArgument.value;

        if (roleColor) {
            roleColor = roleColor.replace(/\W/g, ''); // Remove non-alphanumeric characters
            roleColor = roleColor.toLowerCase();

            // Default colors
            let greyHex = "36393f";
            switch (roleColor) {
                case "red":
                    roleColor = "ff2121";
                    break;
                case "orange":
                    roleColor = "ff6426";
                    break;
                case "yellow":
                    roleColor = "ffc338";
                    break;
                case "green":
                    roleColor = "7dff45";
                    break;
                case "turqouise":
                    roleColor = "45ffb5";
                    break;
                case "blue":
                    roleColor = "084dff";
                    break;
                case "purple":
                    roleColor = "842bff";
                    break;
                case "pink":
                    roleColor = "f6a6ff";
                    break;
                case "burgundy":
                    roleColor = "a62460";
                    break;
                case "black":
                    roleColor = "000001"; // 000000 becomes transparent
                    break;
                case "white":
                    roleColor = "ffffff";
                    break;
                case "grey":
                    roleColor = greyHex;
                    break;
                case "gray":
                    roleColor = greyHex;
                    break;
                default:
                    break;
            };

            if (roleColor.length > 6) roleColor = roleColor.substring(roleColor.length - 6, roleColor.length);
            while (roleColor.length < 6) roleColor = "0" + roleColor;
        };

        if (args[0] == "delete") return deleteRole(`Successfully deleted your personal role and database entry.`, `Your personal role isn't in my database so I can't delete it.`);

        let messageImage = null;
        if (interaction.attachments.size > 0) messageImage = interaction.attachments.first().url;

        let user = interaction.member.user;

        // Might want to change checks to be more inline with v13's role tags (assuming a mod role tag will be added)
        // Needs to be bugfixed, doesn't check booster role properly anymore and would allow anyone to use command
        if (!boosterRole && !interaction.member.permissions.has("MANAGE_ROLES") && !adminBool) return deleteRole(`Since you can't manage a personal role anymore I cleaned up your old role.`, `You need to be a Nitro Booster or moderator to manage a personal role.`);

        if (roleDB) {
            let editReturnString = `Updated your role successfully; `;
            let personalRole = interaction.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (!personalRole) return createRole();

            if (!args[0]) roleColor = personalRole.color;

            if (roleColor != personalRole.color) editReturnString += `Color set to \`#${roleColor}\`. `;

            personalRole.edit({
                name: user.tag,
                color: roleColor,
                position: personalRolePosition
            }).catch(e => {
                // console.log(e);
                return sendMessage({ client: client, interaction: interaction, content: `An error occurred.` });
            });

            if (messageImage && iconsAllowed) {
                try {
                    await personalRole.setIcon(messageImage);
                    editReturnString += `Image updated. `;
                } catch (e) {
                    // console.log(e);
                    let roleIconSizeLimit = `256kb`;
                    editReturnString += `Failed to update the image, make sure the image is under ${roleIconSizeLimit}. `;
                };
            } else if (messageImage && !iconsAllowed) {
                editReturnString += `Failed to update the image, **${interaction.guild.name}** does not have role icons unlocked. `;
            };

            // Re-add role if it got removed
            if (!interaction.member.roles.cache.find(r => r.name == user.tag)) interaction.member.roles.add(personalRole.id);

            return sendMessage({ client: client, interaction: interaction, content: editReturnString });

        } else {
            // Create role if it doesn't exit yet
            return createRole();
        };

        async function createRole() {
            // Clean up possible old entry
            let oldEntry = await PersonalRoles.findOne({ where: { server_id: interaction.guild.id, user_id: interaction.member.id } });
            if (oldEntry) await oldEntry.destroy();

            if (!args[0]) roleColor = 0;

            // Create role
            try {
                await interaction.guild.roles.create({
                    name: user.tag,
                    color: roleColor,
                    position: personalRolePosition,
                    reason: `Personal role for ${user.tag}.`,
                });
            } catch (e) {
                // console.log(error);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    return sendMessage({ client: client, interaction: interaction, content: `An error occurred creating a role.` });
                };
            };

            let createdRole = await interaction.guild.roles.cache.find(role => role.name == user.tag);
            try {
                if (messageImage && iconsAllowed) createdRole.setIcon(messageImage);
            } catch (e) {
                // console.log(e);
            };

            interaction.member.roles.add(createdRole.id);
            await PersonalRoles.upsert({ server_id: interaction.guild.id, user_id: interaction.member.id, role_id: createdRole.id });

            return sendMessage({ client: client, interaction: interaction, content: `Created a personal role for you successfully.` });
        };

        async function deleteRole(successString, failString) {
            if (roleDB) {
                let oldRole = interaction.guild.roles.cache.find(r => r.id == roleDB.role_id);
                if (oldRole) await oldRole.delete();
                await roleDB.destroy();
                return sendMessage({ client: client, interaction: interaction, content: successString });
            } else {
                return sendMessage({ client: client, interaction: interaction, content: failString });
            };
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "personalrole",
    description: "Updates your personal role color.",
    options: [{
        name: "color-hex",
        type: "STRING",
        description: "Specify the color you want. Type \"delete\" to delete your role."
    }]
};