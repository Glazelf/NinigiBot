import { ApplicationIntegrationType } from 'discord.js';

export default (interaction) => {
    console.log(`inGuild: ${interaction.inGuild()}`)
    console.log(Object.keys(interaction.authorizingIntegrationOwners).includes(ApplicationIntegrationType.GuildInstall.toString()))
    console.log(interaction.authorizingIntegrationOwners)
    return (interaction.inGuild() && Object.keys(interaction.authorizingIntegrationOwners).includes(ApplicationIntegrationType.GuildInstall.toString()));
};