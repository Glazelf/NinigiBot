import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import { changeAutoFeed } from "../../database/dbServices/shinx.api.js";

const autofeed_modes = [
    {
        "name": "No auto mode",
        "value": 0
    },
    {
        "name": "Feed automatically",
        "value": 1
    },
    {
        "name": "Feed automatically, buy more food if needed.",
        "value": 2
    }
];

export default async (client, interaction, ephemeral) => {
    try {
        ephemeral = true;
        let returnString;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis)) emotesAllowed = false;
        let master = interaction.user;
        let mode_num = interaction.options.getInteger("mode");
        let res = await changeAutoFeed(master.id, mode_num);
        let mode_str = autofeed_modes[mode_num].name;
        returnString = res ? `Changed autofeed to: ${mode_str}` : `Autofeed already set to: ${mode_str}`;
        return sendMessage({
            client: client,
            interaction: interaction,
            content: returnString,
            ephemeral: ephemeral || res != true
        });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "autofeed",
    description: "Automatize the feeding process of Shinx",
    options: [{
        name: "mode",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Mode you want to set",
        required: true,
        choices: autofeed_modes
    }]
};