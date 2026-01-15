import { ApplicationIntegrationType } from 'discord.js';

export default (interaction: any) => {
    return (interaction.inGuild() && Object.keys(interaction.authorizingIntegrationOwners).includes(ApplicationIntegrationType.GuildInstall.toString()));
};