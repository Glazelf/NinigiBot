module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // NEVER remove this, even for testing. Research eval() before doing so, at least.
        if (message.author.id !== client.config.ownerID) {
            return message.reply(globalVars.lackPerms);
        };

        const code = args.join(" ");
        let evaled = eval(code);

        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

        if (evaled.length > 1990) evaled = evaled.substring(0, 1990);

        return message.channel.send(clean(evaled), { code: "js" });

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
    aliases: ["var", "variable", "code"]
};
