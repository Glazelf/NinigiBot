exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const fs = require("fs");
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { Languages } = require('../../database/dbObjects');
        let oldLanguage = await Languages.findOne({ where: { server_id: message.guild.id } });

        let subCommand = args[0];
        if (!subCommand) {
            if (oldLanguage) {
                return sendMessage(client, message, `The current language is: \`${oldLanguage.language}\`.`);
            };
            return sendMessage(client, message, `Please provide a valid string to change the language to.`);
        };
        subCommand = subCommand.toLowerCase();
        if (!Object.keys(client.languages).includes(subCommand)) {
            // Buttons
            let languageButtons = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton({ label: 'Language list', style: 'LINK', url: `https://github.com/Glazelf/NinigiBot/tree/master/objects/languages` }));
            return sendMessage(client, message, `That is not a supported language.`, null, null, true, languageButtons);
        };

        if (oldLanguage) await oldLanguage.destroy();
        if (subCommand == "en" || subCommand == "reset") return sendMessage(client, message, `Language has been reset to \`en\`.`);
        await Languages.upsert({ server_id: message.guild.id, language: subCommand });

        return sendMessage(client, message, `Language has been changed to \`${subCommand}\`.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "language",
    aliases: [],
    description: "Change the language for this bot for this server."
};