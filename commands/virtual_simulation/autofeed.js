import {
    SlashCommandBuilder,
    SlashCommandIntegerOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import { changeAutoFeed } from "../../database/dbServices/shinx.api.js";

const autoFeedModes = [
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

export default async (interaction, ephemeral) => {
    ephemeral = true;
    let returnString;
    let master = interaction.user;
    let modeNumber = interaction.options.getInteger("mode");
    let res = await changeAutoFeed(master.id, modeNumber);
    let modeString = autoFeedModes[modeNumber].name;
    returnString = res ? `Changed autofeed to: ${modeString}` : `Autofeed already set to: ${modeString}`;
    return sendMessage({
        interaction: interaction,
        content: returnString,
        ephemeral: ephemeral || res != true
    });
};

// Integer options
const modeOption = new SlashCommandIntegerOption()
    .setName("mode")
    .setDescription("Mode you want to set.")
    .setChoices(autoFeedModes)
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("autofeed")
    .setDescription("Automate the feeding process of Shinx.")
    .addIntegerOption(modeOption);