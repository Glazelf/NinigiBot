import {
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder,
    codeBlock
} from "discord.js";
import axios from "axios";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction) => {
    let btd6api = "https://data.ninjakiwi.com/btd6/";
    let oak = interaction.options.getString("oak");
    let failString = "The following error occurred while getting data from the API:{1}Read more on the Ninja Kiwi API and OAK tokens [here](<https://support.ninjakiwi.com/hc/en-us/articles/13438499873937-Open-Data-API>).";

    switch (interaction.options.getSubcommand()) {
        case "user":
            let btd6apiSave = `${btd6api}save/${oak}`;
            let btd6apiUser = `${btd6api}users/${oak}`;
            let saveResponse = await axios.get(btd6apiSave);
            let userResponse = await axios.get(btd6apiUser);
            let saveData = saveResponse.data;
            let userData = userResponse.data;
            if (!saveData.success || !userData.success) return sendMessage({ interaction: interaction, content: failString.replace("{1}", codeBlock(saveData.error)) });
            console.log(userData)
            break;
    };

    return sendMessage({ interaction: interaction, content: "Sniper Monkey" });
};

// String options
const oakOption = new SlashCommandStringOption()
    .setName("oak")
    .setDescription("Specify Open Access Key.")
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const userSubcommand = new SlashCommandSubcommandBuilder()
    .setName("user")
    .setDescription("See information on a user.")
    .addStringOption(oakOption)
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("btd6")
    .setDescription("Shows BTD6 data.")
    .addSubcommand(userSubcommand);