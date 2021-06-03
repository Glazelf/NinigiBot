const sendMessage = require('../../util/sendMessage');

exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        let DefaultEmbedColor = "#99AB5";

        if (!args[0]) return sendMessage(client, message, `Please provide a role name or ID.`);

        // Split off command
        let input = args.join(" ");

        // Author avatar
        let avatar = message.member.user.displayAvatarURL({ format: "png", dynamic: true });

        // Check for role
        let role = message.guild.roles.cache.find(role => role.name.toLowerCase() === input.toLowerCase());
        if (!role) role = message.guild.roles.cache.get(input);

        if (input.toLowerCase() == "none") {
            let fetchedMembers = await message.guild.members.fetch();
            let noRoleMembers = 0;
            fetchedMembers.forEach(member => {
                if (member.roles.cache.size == 1) {
                    noRoleMembers += 1;
                };
            });
            const noRoleEmbed = new Discord.MessageEmbed()
                .setColor(DefaultEmbedColor)
                .setAuthor(`Users in ${message.guild.name} without a role`, avatar)
                .addField("Members:", noRoleMembers, true)
                .setFooter(message.member.user.tag)
                .setTimestamp();

            return sendMessage(client, message, null, noRoleEmbed);
        };

        if (!role) return sendMessage(client, message, `I couldn't find that role. Make sure you provide a valid name or ID.`);

        // Role color
        let roleColor = `#${role.color.toString(16)}`;
        let embedColor = roleColor;
        if (roleColor == "#0") {
            roleColor = "Default";
            embedColor = DefaultEmbedColor;
        };

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
            .setAuthor(`${role.name} (${role.id})`, avatar)
            .addField("Tag:", role, true)
            .addField("Color:", roleColor, true)
            .addField("Members:", memberCount, true)
            .addField("Position:", role.rawPosition, true)
            .addField("Properties:", roleProperties, false)
            .setFooter(message.member.user.tag)
            .setTimestamp();

        return sendMessage(client, message, null, roleEmbed);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
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