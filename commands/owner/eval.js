exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        // NEVER remove this, even for testing. Research eval() before doing so, at least.
        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const input = args.join(" ");
        try {
            var evaled = eval(input);
        } catch (e) {
            // console.log(e);
            return sendMessage(client, message, `An error occurred and has been logged.`);
        };

        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

        if (evaled.length > 1990) evaled = evaled.substring(0, 1990);

        // Check if requested content has any matches with client config. Should avoid possible security leaks.
        for (const [key, value] of Object.entries(client.config)) {
            if (evaled.includes(value)) return sendMessage(client, message, `For security reasons this content can't be returned.`);
        };

        let returnString = Discord.Formatters.codeBlock("js", clean(evaled));

        return sendMessage(client, message, returnString);

        function clean(text) {
            if (typeof (text) === "string")
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "eval",
    aliases: ["js"],
    description: "Execute JS.",
    options: [{
        name: "input",
        type: "STRING",
        description: "JS to execute."
    }]
};
