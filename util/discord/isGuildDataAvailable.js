import { ApplicationIntegrationType } from 'discord.js';

export default (interaction) => {
    console.log(`inGuild: ${interaction.inGuild()}`)
    console.log(Object.keys(interaction.authorizingIntegrationOwners).includes(ApplicationIntegrationType.GuildInstall.toString()))
    console.log(interaction.authorizingIntegrationOwners)
    console.log(ApplicationIntegrationType.GuildInstall)
    console.log(ApplicationIntegrationType)
    return (interaction.inGuild() && Object.keys(interaction.authorizingIntegrationOwners).includes(ApplicationIntegrationType.GuildInstall.toString()));
};