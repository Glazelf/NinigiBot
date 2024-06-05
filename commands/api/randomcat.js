import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import axios from "axios";
import { uniqueNamesGenerator, names } from 'unique-names-generator'; // Random name generator that can be seeded

export default async (client, interaction, ephemeral) => {
    try {
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;

        let catText = interaction.options.getString("text");
        let standardCatText = "Meow";
        if (!catText) catText = standardCatText;

        let catAAS = "https://cataas.com/cat";
        let catAPI = `${catAAS}?json=true`;
        let response = await axios.get(catAPI);
        let catImage = null;
        let catNameSeed = null;
        catImage = `${catAAS}/${response.data._id}`;
        if (catText !== standardCatText) catImage += `/says/${encodeURIComponent(encodeURIComponent(catText))}`; // Double encode to escape periods and slashes
        catNameSeed = response.data._id;
        let catName = uniqueNamesGenerator({
            dictionaries: [names],
            seed: catNameSeed
        });
        const catEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setImage(catImage)
            .setFooter({ text: `"${catText}" -${catName}` });
        return sendMessage({ client: client, interaction: interaction, embeds: catEmbed, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "randomcat",
    description: "Get a random cat image.",
    options: [{
        name: "text",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Text to put over the image."
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};