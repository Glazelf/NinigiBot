module.exports.run = async (client, message, args = null) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        // NEVER remove this, even for testing. Research eval() before doing so, at least.
        if (message.author.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        const input = args.join(" ");
        try {
            var evaled = eval(input);
        } catch (e) {
            // console.log(e);
            return sendMessage(client, message, `An error occurred and has been logged.`);
        };

        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

        if (evaled.length > 1990) evaled = evaled.substring(0, 1990);

        return sendMessage(client, message, clean(evaled), true, [], "js");

        function clean(text) {
            if (typeof (text) === "string")
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

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
