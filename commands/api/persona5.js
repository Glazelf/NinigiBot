exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const fs = require("fs");
        const path = require("path");
        const randomNumber = require('../../util/randomNumber');
        const capitalizeString = require('../../util/capitalizeString');
        const isAdmin = require('../../util/isAdmin');

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        let buttonArray = [];
        await interaction.deferReply({ ephemeral: ephemeral });
        // Imports:
        // rarePersonaeRoyal; list of treasure Persona
        // rareCombosRoyal; ??
        // arcana2CombosRoyal; arcana fusion combos
        // specialCombosRoyal; special fusions
        // dlcPersonaRoyal; list of DLC Persona
        eval(fs.readFileSync("submodules/persona5_calculator/data/Data5Royal.js", "utf8"));
        // Imports personaMapRoyal; object including all persona data
        eval(fs.readFileSync("submodules/persona5_calculator/data/PersonaDataRoyal.js", "utf8"));
        // Imports skillMapRoyal; object including all skill AND trait data
        eval(fs.readFileSync("submodules/persona5_calculator/data/SkillDataRoyal.js", "utf8"));
        let p5Embed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);

        switch (interaction.options.getSubcommand()) {
            case "persona":
                console.log(personaMapRoyal)
                // List abilities and skills with unlock levels and descriptions
                // List weaknesses, arcana, starting level etc.
                // add banner images with following format: https://static.wikia.nocookie.net/megamitensei/images/f/ff/Jack_Frost_P5R.jpg

                // Optional: use calculator to calc paths to fuse this monster
                break;
            case "skill":
                // List description and personas with this skill
                break;
            case "trait":
                // List description and personas with this trait
                break;
        };
        return sendMessage({ client: client, interaction: interaction, embeds: p5Embed, ephemeral: ephemeral, components: buttonArray });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "persona5",
    description: "Shows Persona 5 data.",
    options: [{
        name: "persona",
        type: "SUB_COMMAND",
        description: "Get info on a specific Persona.",
        options: [{
            name: "persona",
            type: "STRING",
            description: "Specify Persona by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "skill",
        type: "SUB_COMMAND",
        description: "Get info on a skill.",
        options: [{
            name: "skill",
            type: "STRING",
            description: "Specify skill by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "trait",
        type: "SUB_COMMAND",
        description: "Get info on a trait.",
        options: [{
            name: "trait",
            type: "STRING",
            description: "Specify trait by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};