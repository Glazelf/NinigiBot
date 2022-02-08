exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        let DefaultEmbedColor = globalVars.embedColor;

        if (!args[0]) return sendMessage({ client: client, interaction: interaction, content: `Please provide a role name or ID.` });

        // Split off command
        let input = args.join(" ");

        let user = interaction.member.user;

        // Author avatar
        let avatar = interaction.member.displayAvatarURL(globalVars.displayAvatarSettings);

        // Check for role
        let role = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === input.toLowerCase());
        if (!role) role = await interaction.guild.roles.fetch(input);

        let roleEmbed = new Discord.MessageEmbed()
            .setFooter({ text: user.tag })
            .setTimestamp();

        if (input.toLowerCase() == "none" && !role) {
            let fetchedMembers = await interaction.guild.members.fetch();
            let noRoleMembers = 0;
            fetchedMembers.forEach(member => {
                if (member.roles.cache.size == 1) {
                    noRoleMembers += 1;
                };
            });
            roleEmbed
                .setColor(DefaultEmbedColor)
                .setAuthor({ name: `Users in ${interaction.guild.name} without a role`, iconURL: avatar })
                .addField("Members:", noRoleMembers.toString(), true);

            return sendMessage({ client: client, interaction: interaction, embeds: roleEmbed });
        };

        if (!role) return sendMessage({ client: client, interaction: interaction, content: `I couldn't find that role. Make sure you provide a valid name or ID.` });

        // Role visuals
        let icon = role.iconURL(globalVars.displayAvatarSettings);
        let embedColor = role.hexColor;
        if (embedColor == "#000000") embedColor = globalVars.embedColor;

        // Member count
        let memberCount = interaction.guild.members.cache.filter(member => member.roles.cache.find(loopRole => loopRole == role)).size;

        // Properties
        let roleProperties = "";
        if (role.hoist) roleProperties = `${roleProperties}\nSorted seperately`;
        if (role.mentionable) roleProperties = `${roleProperties}\nCan be mentioned`;
        if (role.managed) roleProperties = `${roleProperties}\nManaged by integration`;
        if (roleProperties.length == 0) roleProperties = "None";

        // Embed
        roleEmbed
            .setColor(embedColor)
            .setAuthor({ name: `${role.name} (${role.id})`, iconURL: avatar })
            .setThumbnail(icon)
            .addField("Role:", role.toString(), true)
            .addField("Color:", role.hexColor, true)
            .addField("Members:", memberCount.toString(), true)
            .addField("Position:", role.rawPosition.toString(), true)
            .addField("Properties:", roleProperties, false);

        return sendMessage({ client: client, interaction: interaction, embeds: roleEmbed });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "roleinfo",
    description: "Sends info about a role.",
    options: [{
        name: "role-name",
        type: "STRING",
        description: "Specify role by name or ID."

    }]
};