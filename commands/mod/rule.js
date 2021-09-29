exports.run = async (client, message, args) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!adminBool) return sendMessage(client, message, globalVars.lackPerms);

        const { RulesChannels, ServerRules, Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let isFAQ = message.content.startsWith(`${prefix}faq`); // Use this boolean to distinguish FAQ and rule behaviour and text
        let ruleNumber;
        let ruleChannel;
        let ruleTitle;
        let ruleBody;

        if (!args[0]) return sendMessage(client, message, 'Please provide a rule number.');
        if (isNaN(args[0])) {
            // No number provided, check for channel instead, if no channel match return.
        } else {
            if (args[1]) {
                ruleNumber = args[0];
                // check title/body and set them to db
            } else {
                // show rule by number provided
            };
        };

        return sendMessage(client, message, `Rules time.`);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "rule",
    aliases: ["rules", "faq"],
    description: "Edit or display rules of this server."
};