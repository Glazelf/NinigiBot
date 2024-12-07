import {
    InteractionContextType,
    codeBlock,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/discord/perms/isOwner.js";
import util from "util";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    ephemeral = true;
    let ownerBool = await isOwner(interaction.client, interaction.user);
    // NEVER remove this, even for testing. Research eval() before doing so, at least.
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });
    await interaction.deferReply({ ephemeral: ephemeral });

    const input = interaction.options.getString("input");
    let evaled;
    try {
        evaled = await eval(`async () => {${input}}`)();
    } catch (e) {
        // console.log(e);
        return sendMessage({ interaction: interaction, content: `Error occurred:\n${codeBlock("fix", e.stack)}` });
    };
    if (typeof evaled !== "string") evaled = util.inspect(evaled);
    if (evaled.length > 1990) evaled = evaled.substring(0, 1990);
    // Check if requested content has any matches with environment variables. Should avoid possible security leaks.
    for (const [key, value] of Object.entries(process.env)) {
        if (evaled.includes(value) && ephemeral == false) return sendMessage({ interaction: interaction, content: `For security reasons this content can't be returned.` });
    };
    let returnString = codeBlock("js", clean(evaled));
    return sendMessage({ interaction: interaction, content: returnString });

    function clean(text) {
        if (typeof (text) === "string") {
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        } else {
            return text;
        };
    };
};

export const guildID = process.env.DEV_SERVER_ID;

// String options
const inputOption = new SlashCommandStringOption()
    .setName("input")
    .setDescription("JS to execute.")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Execute JS.")
    .setContexts([InteractionContextType.Guild])
    .addStringOption(inputOption);