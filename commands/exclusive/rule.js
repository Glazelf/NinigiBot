exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.guild.id !== client.config.botServerID) return;

        const Discord = require("discord.js");
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        return sendMessage(client, message, `I got tired of manually updating the text so untill I've made this adaptive I disabled this command haha. For progress: <https://github.com/Glazelf/NinigiBot/issues/105>.`, null, null, false);

        async function getRule(object, input) {
            var keyList = Object.keys(object);
            keyList.forEach(function (key) {
                if (input == key) {
                    objectText = object[key];
                };
            });
        };

        async function getFAQName(object, input) {
            var keyList = Object.keys(object);
            keyList.forEach(function (key) {
                if (input == key) {
                    faqName = object[key];
                };
            });
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "rules",
    aliases: ["faq", "rule"],
    description: "Sends a rule.",
    serverID: client.config.botServerID,
    options: [{
        name: "rule-id",
        type: "INTEGER",
        description: "Number of the rule to send."
    }]
};