import Discord from "discord.js";
import logger from "../../util/logger";
import sendMessage from "../../util/sendMessage";
import userApi from "../../database/dbServices/user.api";

export default async (client, interaction) => {
    try {
        let ephemeral = true;
        let res, returnString;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis)) emotesAllowed = false;
        let master = interaction.user;
        foodArg = interaction.options.getInteger("food");
        res = await userApi.buyFood(master.id, foodArg);
        returnString = res ? `Added ${foodArg}🍗 to your account!` : `Not enough money!`;
        return sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral || res != true });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "buyfood",
    description: "Buy food for Shinx",
    options: [{
        name: "food",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "The amount of food you want to buy.",
        required: true,
        minValue: 1
    }]
};