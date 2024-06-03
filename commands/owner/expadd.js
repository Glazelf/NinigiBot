import Discord from "discord.js";
import logger from "../../util/logger";
import sendMessage from "../../util/sendMessage";
import isOwner from "../../util/isOwner";
import shinxApi from "../../database/dbServices/shinx.api";

export default async (client, interaction) => {
    try {
        ephemeral = true;
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: client.globalVars.lackPerms });

        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis)) emotesAllowed = false;

        let userArg = interaction.options.getUser("user");
        if (!userArg) return sendMessage({ client: client, interaction: interaction, content: `Could not find user.` });
        let expArg = interaction.options.getInteger("amount");
        await shinxApi.addExperience(userArg.id, expArg);
        returnString = `Added ${expArg} points to ${userArg}'s shinx!`;
        return sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral });
    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
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