import { ApplicationIntegrationType } from 'discord.js';

export default (interaction) => {
    // A little ugly to hardcode this text but they made the variables less consistent
    console.log(interaction.authorizingIntegrationOwners)
    return (interaction.inGuild() && Object.keys(interaction.authorizingIntegrationOwners).includes("guildId"));
};