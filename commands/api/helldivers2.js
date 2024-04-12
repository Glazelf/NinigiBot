const Discord = require("discord.js");
exports.run = async (client, interaction, logger, globalVars, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const axios = require("axios");
        let api = "https://helldiverstrainingmanual.com/api/v1/";

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        await interaction.deferReply({ ephemeral: ephemeral });
        let helldiversEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor);

        switch (interaction.options.getSubcommand()) {
            case "planet":
                let inputPlanet = interaction.options.getString("planet");
                let planetsResponse = await axios.get(`${api}planets`);
                let planetsData = planetsResponse.data;
                let planetObject = Object.entries(planetsData).find(([key, value]) => value.name.toLowerCase() == inputPlanet.toLowerCase());
                if (!planetObject) return sendMessage({ client: client, interaction: interaction, content: "Could not find the specified planet." });
                let planetIndex = planetObject[0];
                planetObject = planetObject[1];
                let planetDescription = `${planetObject.sector} Sector.`;
                // Campaign status data is of all planets, so always requested and then checked if requested planet is in the data
                let campaignStatus = await axios.get(`${api}war/campaign`);
                let campaignStatusPlanet = campaignStatus.data.find(planet => planet.planetIndex == planetIndex);
                let campaignStatusString = "";
                if (campaignStatusPlanet) {
                    campaignStatusString = `Being liberated from the ${campaignStatusPlanet.faction}.`;
                    if (campaignStatusPlanet.defense == true) campaignStatusString = campaignStatusString.replace("liberated", "defended");
                    campaignStatusString += `\nProgress: ${Math.round(campaignStatusPlanet.percentage * 100) / 100}%\nHelldivers: ${campaignStatusPlanet.players}`;
                    if (campaignStatusPlanet.expireDateTime) campaignStatusString += `\nWithdrawal <t:${Math.floor(campaignStatusPlanet.expireDateTime)}:R>.`;
                };
                let planetBiome = null;
                if (planetObject.biome) {
                    planetBiome = planetObject.biome.slug.charAt(0).toUpperCase() + planetObject.biome.slug.slice(1); // Capitalize first letter
                    helldiversEmbed.addFields([{ name: `${planetBiome} Biome:`, value: planetObject.biome.description, inline: false }]);
                };
                // Environmental effects like earthquakes, extreme weather effects etc.
                let environmentals = "None.";
                if (planetObject.environmentals && planetObject.environmentals.length > 0) {
                    environmentals = "";
                    planetObject.environmentals.forEach(environmental => {
                        environmentals += `**${environmental.name}**: ${environmental.description}\n`;
                    });
                };
                helldiversEmbed
                    .setAuthor({ name: planetObject.name })
                    .setDescription(planetDescription)
                    .addFields([{ name: "Environmentals:", value: environmentals, inline: true }]);
                if (campaignStatusPlanet) helldiversEmbed.addFields([{ name: "Campaign Status:", value: campaignStatusString, inline: false }]);
                break;
        };
        return sendMessage({ client: client, interaction: interaction, embeds: helldiversEmbed, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "helldivers2",
    description: `Shows Helldivers 2 data.`,
    options: [{
        name: "planet",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a planet.",
        options: [{
            name: "planet",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify planet by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }]
};