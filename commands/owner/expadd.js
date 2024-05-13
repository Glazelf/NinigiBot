const Discord = require("discord.js");
exports.run = async (client, interaction, logger) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: client.globalVars.lackPerms });

        const shinxApi = require('../../database/dbServices/shinx.api');

        let ephemeral = true;
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