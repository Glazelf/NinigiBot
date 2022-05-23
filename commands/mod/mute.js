exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');
        let adminBool = await isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has("MODERATE_MEMBERS") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let user = interaction.options.getUser("user");
        let member = await interaction.guild.members.fetch(user.id);
        if (!member) return sendMessage({ client: client, interaction: interaction, content: `Please provide a user to mute.` });

        let muteTime = 60;
        let maxMuteTime = 2.419e+9; // Max time is 28 days
        let timeArg = interaction.options.getInteger("time");
        if (timeArg) muteTime = timeArg;
        if (isNaN(muteTime) || 1 > muteTime) return sendMessage({ client: client, interaction: interaction, content: `Please provide a valid number.` });
        if (muteTime > maxMuteTime) muteTime = maxMuteTime;

        if (!member) return sendMessage({ client: client, interaction: interaction, content: `Please use a proper mention if you want to mute someone.` });

        // Check permissions
        let userRole = interaction.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position && !adminBool) return sendMessage({ client: client, interaction: interaction, content: `You don't have a high enough role to mute **${member.user.tag}** (${member.id}).` });

        let reason = "Not specified.";
        let reasonArg = interaction.options.getString("reason");
        if (reasonArg) reason = reasonArg;

        let displayTime = muteTime; // Save time for return strings
        muteTime = muteTime * 1000 * 60; // Convert to minutes
        if (muteTime > maxMuteTime) muteTime = maxMuteTime;
        let muteReturnString = `Muted **${member.user.tag}** (${member.id}) for ${displayTime} minute(s) for reason: \`${reason}\`.`;

        if (member.communicationDisabledUntil) { // Check if a timeout timestamp exists
            if (member.communicationDisabledUntil > Date.now()) { // Only attempt to unmute if said timestamp is in the future, if not we can just override it
                muteTime = null;
                muteReturnString = `Unmuted **${member.user.tag}** (${member.id}).`;
            };
        };

        let time = await getTime(client);
        let reasonInfo = `-${interaction.user.tag} (${time})`;

        // Timeout logic
        try {
            await member.timeout(muteTime, `${reason} ${reasonInfo}`);
            return sendMessage({ client: client, interaction: interaction, content: muteReturnString });
        } catch (e) {
            // console.log(e);
            if (e.toString().includes("Missing Permissions")) return sendMessage({ client: client, interaction: interaction, content: `Failed to toggle timeout on **${user.tag}**. I probably lack permissions.` });
            // Log error
            logger(e, client, interaction);
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "mute",
    description: "Times the target out.",
    options: [{
        name: "user",
        type: "USER",
        description: "Specify user.",
        required: true
    }, {
        name: "time",
        type: "INTEGER",
        description: "Amount of minutes to mute."
    }, {
        name: "reason",
        type: "STRING",
        description: "Reason for mute."
    }]
}; 
