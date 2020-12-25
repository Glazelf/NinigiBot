
exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");

        // Split off command
        let arg = message.content.slice(1).trim();
        let [, , textMessage] = arg.match(/(\w+)\s*([\s\S]*)/);
        let input = textMessage;

        // Check for role
        let role = message.guild.roles.cache.find(role => role.name.toLowerCase() === input.toLowerCase());
        if (!role) role = message.guild.roles.cache.get(input);
        if (!role) return message.channel.send(`> I couldn't find that role. Make sure you provide a valid name or ID, ${message.author}`);

        // Role color
        let roleColor = `#${role.color.toString(16)}`;
        let embedColor = roleColor;
        if (roleColor == "#0") {
            roleColor = "Default";
            embedColor = globalVars.embedColor;
        };

        // Author avatar
        let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });

        // Convert true/false to Yes/No
        let hoist = boolConvert(role.hoist);
        let managed = boolConvert(role.managed);
        let mentionable = boolConvert(role.mentionable);

        // Embed
        const roleEmbed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setAuthor(`${role.name} (${role.id})`, avatar)
            .addField("Tag:", role, true)
            .addField("Color:", roleColor, true)
            .addField("Sorted seperately:", hoist, false)
            .addField("Can be mentioned:", mentionable, false)
            .addField("Managed by integration:", managed, false)
            .setFooter(message.author.tag)
            .setTimestamp();

        return message.channel.send(roleEmbed);

        function boolConvert(input) {
            if (input == true) input = "Yes";
            if (input == false) input = "No";
            return input;
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "roleinfo",
    aliases: []
};