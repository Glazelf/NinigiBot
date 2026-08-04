import { ApplicationIntegrationType } from 'discord.js';

export default (interaction) => {
    // When no guild, guildId is present but nulled
    return (interaction.inGuild() && interaction.authorizingIntegrationOwners.guildId !== null);
};