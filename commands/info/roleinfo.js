exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        let DefaultEmbedColor = globalVars.embedColor;

        if (!args[0]) return sendMessage(client, message, `Please provide a role name or ID.`);

        // Split off command
        let input = args.join(" ");

        let user = message.member.user;

        // Author avatar
        let avatar = message.member.displayAvatarURL(globalVars.displayAvatarSettings);

        // Check for role
        let role = message.guild.roles.cache.find(role => role.name.toLowerCase() === input.toLowerCase());
        if (!role) role = await message.guild.roles.fetch(input);

        if (input.toLowerCase() == "none" && !role) {
            let fetchedMembers = await message.guild.members.fetch();
            let noRoleMembers = 0;
            fetchedMembers.forEach(member => {
                if (member.roles.cache.size == 1) {
                    noRoleMembers += 1;
                };
            });
            const noRoleEmbed = new Discord.MessageEmbed()
                .setColor(DefaultEmbedColor)
                .setAuthor({ name: `Users in ${message.guild.name} without a role`, iconURL: avatar })
                .addField("Members:", noRoleMembers.toString(), true)
                .setFooter(user.tag)
                .setTimestamp();

            return sendMessage(client, message, null, noRoleEmbed);
        };

        if (!role) return sendMessage(client, message, `I couldn't find that role. Make sure you provide a valid name or ID.`);

        // Role visuals
        let icon = role.iconURL(globalVars.displayAvatarSettings);
        let embedColor = role.hexColor;
        if (embedColor == "#000000") embedColor = globalVars.embedColor;

        // Member count
        let memberCount = message.guild.members.cache.filter(member => member.roles.cache.find(loopRole => loopRole == role)).size;

        // Properties
        let roleProperties = "";
        if (role.hoist) roleProperties = `${roleProperties}\nSorted seperately`;
        if (role.mentionable) roleProperties = `${roleProperties}\nCan be mentioned`;
        if (role.managed) roleProperties = `${roleProperties}\nManaged by integration`;
        if (roleProperties.length == 0) roleProperties = "None";

        // Embed
        const roleEmbed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setAuthor({ name: `${role.name} (${role.id})`, iconURL: avatar })
            .setThumbnail(icon)
            .addField("Role:", role.toString(), true)
            .addField("Color:", role.hexColor, true)
            .addField("Members:", memberCount.toString(), true)
            .addField("Position:", role.rawPosition.toString(), true)
            .addField("Properties:", roleProperties, false)
            .setFooter(user.tag)
            .setTimestamp();

        return sendMessage(client, message, null, roleEmbed);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "roleinfo",
    aliases: [],
    description: "Sends info about a role.",
    options: [{
        name: "role-name",
        type: "STRING",
        description: "Specify role by name or ID."

    }]
};