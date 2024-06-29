import {
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/isOwner.js";
import util from "util";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (client, interaction, ephemeral) => {
    try {
        ephemeral = true;
        let ownerBool = await isOwner(client, interaction.user);
        // NEVER remove this, even for testing. Research eval() before doing so, at least.
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPermsString });
        await interaction.deferReply({ ephemeral: ephemeral });

        const input = interaction.options.getString("input");
        let evaled;
        try {
            evaled = await eval(`async () => {${input}}`)();
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: `Error occurred:\n${codeBlock(e.stack)}` });
        };
        if (typeof evaled !== "string") evaled = util.inspect(evaled);
        if (evaled.length > 1990) evaled = evaled.substring(0, 1990);
        // Check if requested content has any matches with client config. Should avoid possible security leaks.
        for (const [key, value] of Object.entries(config)) {
            if (evaled.includes(value) && ephemeral == false) return sendMessage({ client: client, interaction: interaction, content: `For security reasons this content can't be returned.` });
        };
        let returnString = codeBlock("js", clean(evaled));
        return sendMessage({ client: client, interaction: interaction, content: returnString });

        function clean(text) {
            if (typeof (text) === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            } else {
                return text;
            };
        };

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const guildIDs = [config.devServerID];

// String options
const inputOption = new SlashCommandStringOption()
    .setName("input")
    .setDescription("JS to execute.")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Execute JS.")
    .setDMPermission(false)
    .addStringOption(inputOption);