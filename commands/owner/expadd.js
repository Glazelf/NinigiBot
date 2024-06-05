import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isOwner from "../../util/isOwner.js";
import { addExperience } from "../../database/dbServices/shinx.api.js";

export default async (client, interaction) => {
    try {
        ephemeral = true;
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis)) emotesAllowed = false;

        let userArg = interaction.options.getUser("user");
        if (!userArg) return sendMessage({ client: client, interaction: interaction, content: `Could not find user.` });
        let expArg = interaction.options.getInteger("amount");
        await addExperience(userArg.id, expArg);
        returnString = `Added ${expArg} points to ${userArg}'s shinx!`;
        return sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral });
    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "expadd",
    description: "Add exp to a user shinx.",
    serverID: ["759344085420605471"],
    options: [{
        name: "amount",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Amount of experience to add.",
        required: true
    }, {
        name: "user",
        type: Discord.ApplicationCommandOptionType.User,
        description: "Specify user.",
        required: true
    }]
};