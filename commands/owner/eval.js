const Discord = require("discord.js");
exports.run = async (client, interaction, logger) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        // NEVER remove this, even for testing. Research eval() before doing so, at least.
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: client.globalVars.lackPerms });
        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        const input = interaction.options.getString("input");
        let evaled;
        try {
            evaled = await eval(`async () => {${input}}`)();
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `Error occurred:\n${Discord.codeBlock(e.stack)}` });
        };
        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
        if (evaled.length > 1990) evaled = evaled.substring(0, 1990);
        // Check if requested content has any matches with client config. Should avoid possible security leaks.
        for (const [key, value] of Object.entries(client.config)) {
            if (evaled.includes(value) && ephemeral == false) return sendMessage({ client: client, interaction: interaction, content: `For security reasons this content can't be returned.` });
        };
        let returnString = Discord.codeBlock("js", clean(evaled));
        return sendMessage({ client: client, interaction: interaction, content: returnString });

        function clean(text) {
            if (typeof (text) === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            } else {
                return text;
            };
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
        type: Discord.ApplicationCommandOptionType.String,
        description: "JS to execute.",
        required: true
    }]
};