exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        // NEVER remove this, even for testing. Research eval() before doing so, at least.
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        await interaction.deferReply({ ephemeral: true });

        const input = interaction.options.getString("input");
        try {
            var evaled = eval(input);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `An error occurred and has been logged.` });
        };

        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

        if (evaled.length > 1990) evaled = evaled.substring(0, 1990);

        // Check if requested content has any matches with client config. Should avoid possible security leaks.
        for (const [key, value] of Object.entries(client.config)) {
            if (evaled.includes(value)) return sendMessage({ client: client, interaction: interaction, content: `For security reasons this content can't be returned.` });
        };

        let returnString = Discord.Formatters.codeBlock("js", clean(evaled));

        return sendMessage({ client: client, interaction: interaction, content: returnString });

        function clean(text) {
            if (typeof (text) === "string")
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "eval",
    description: "Execute JS.",
    serverID: ["759344085420605471"],
    options: [{
        name: "input",
        type: "STRING",
        description: "JS to execute.",
        required: true
    }]
};
