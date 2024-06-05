import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import { buyFood } from "../../database/dbServices/user.api.js";

export default async (client, interaction) => {
    try {
        let ephemeral = true;
        let res, returnString;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis)) emotesAllowed = false;
        let master = interaction.user;
        let foodArg = interaction.options.getInteger("food");
        res = await buyFood(master.id, foodArg);
        returnString = res ? `Added ${foodArg}🍗 to your account!` : `Not enough money!`;
        return sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral || res != true });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
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