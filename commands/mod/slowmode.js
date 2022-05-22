exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, interaction.member);

        if (!interaction.member.permissions.has("MANAGE_CHANNELS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });
        if (interaction.channel.type != "GUILD_TEXT") return sendMessage({ client: client, interaction: interaction, content: `This channel type doesn't support slowmode.` });

        let time = args.find(element => element.name == "time").value;
        let slowmodeMaxSeconds = 21600;

        if (time < 0) return sendMessage({ client: client, interaction: interaction, content: `You need to provide a valid amount of seconds.` });
        if (time > slowmodeMaxSeconds) time = slowmodeMaxSeconds;

        await interaction.channel.setRateLimitPerUser(time);
        return sendMessage({ client: client, interaction: interaction, content: `Slowmode set to ${time} seconds.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "slowmode",
    description: "Set slowmode in the current channel.",
    options: [{
        name: "time",
        type: "INTEGER",
        description: "Time in seconds. 0 to disable.",
        required: true
    }]
};