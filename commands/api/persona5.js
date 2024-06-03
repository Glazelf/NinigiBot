const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const fs = require("fs");
        const capitalizeString = require('../../util/capitalizeString');
        const getWikiURL = require('../../util/getWikiURL');

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let buttonArray = [];
        let personaWiki = "https://static.wikia.nocookie.net/megamitensei/images/";
        // Imports:
        // rarePersonaeRoyal; list of treasure Persona
        // rareCombosRoyal; ??
        // arcana2CombosRoyal; arcana fusion combos
        // specialCombosRoyal; special fusions
        // dlcPersonaRoyal; list of DLC Persona names
        eval(fs.readFileSync("submodules/persona5_calculator/data/Data5Royal.js", "utf8"));
        // Imports personaMapRoyal; object including all persona data (incl. DLC)
        eval(fs.readFileSync("submodules/persona5_calculator/data/PersonaDataRoyal.js", "utf8"));
        // Imports skillMapRoyal; object including all skill AND trait data
        eval(fs.readFileSync("submodules/persona5_calculator/data/SkillDataRoyal.js", "utf8"));
        // Imports itemMapRoyal; object including all item names mapped to item type/descriptions
        eval(fs.readFileSync("submodules/persona5_calculator/data/ItemDataRoyal.js", "utf8"));
        let p5Embed = new Discord.EmbedBuilder()
            .setColor(client.globalVars.embedColor);

        switch (interaction.options.getSubcommand()) {
            case "persona":
                // TODO: use calculator to calc paths to fuse this monster
                let personaInput = interaction.options.getString("persona");
                let personaObject = personaMapRoyal[personaInput];
                if (!personaObject) return sendMessage({ client: client, interaction: interaction, content: `Could not find that Persona.` });
                let personaWikiName = personaInput.replaceAll(" ", "_");
                if (personaWikiName == "Mara") personaWikiName = "Mara_FF";
                let personaImageFile = `${personaWikiName}_P5R.jpg`;
                let personaImage = getWikiURL(personaImageFile, personaWiki);
                // Weaknesses string
                let elementalMatchup = `Physical: ${getWeaknessString(personaObject.elems[0])}\nGun: ${getWeaknessString(personaObject.elems[1])}\nFire: ${getWeaknessString(personaObject.elems[2])}\nIce: ${getWeaknessString(personaObject.elems[3])}\nElectric: ${getWeaknessString(personaObject.elems[4])}\nWind: ${getWeaknessString(personaObject.elems[5])}\nPsychic: ${getWeaknessString(personaObject.elems[6])}\nNuclear: ${getWeaknessString(personaObject.elems[7])}\nBless: ${getWeaknessString(personaObject.elems[8])}\nCurse: ${getWeaknessString(personaObject.elems[9])}`;
                // Stat string
                let personaStats = `Strength: ${personaObject.stats[0]}\nMagic: ${personaObject.stats[1]}\nEndurance: ${personaObject.stats[2]}\nAgility: ${personaObject.stats[3]}\nLuck: ${personaObject.stats[4]}`;
                // Skills string
                let personaSkills = "";
                for await (const [key, value] of Object.entries(personaObject.skills)) {
                    personaSkills += `Level ${value}: ${key}\n`;
                };
                // Itemization string
                let personaItem = getItemString(personaObject.item);
                let personaItemAlarm = getItemString(personaObject.itemr);
                p5Embed
                    .setTitle(`${personaInput} (${personaObject.arcana})`)
                    .setDescription(elementalMatchup)
                    .addFields([
                        { name: "Stats:", value: `Level: ${personaObject.level}\nTrait: ${personaObject.trait}\n${personaStats}`, inline: true },
                        { name: "Skills:", value: personaSkills, inline: true },
                        { name: "Item:", value: personaItem, inline: false },
                        { name: "Item (Fusion Alarm):", value: personaItemAlarm, inline: false }
                    ])
                    .setImage(personaImage);
                break;
            case "skill":
                let skillInput = interaction.options.getString("skill");
                let skillObject = skillMapRoyal[skillInput];
                if (!skillObject || skillObject.element == "trait") return sendMessage({ client: client, interaction: interaction, content: `Could not find that skill.` });
                let skillPersonas = "";
                if (skillObject.unique) {
                    skillPersonas += `${skillObject.unique}: Unique\n`;
                };
                if (skillObject.personas) {
                    for await (const [key, value] of Object.entries(skillObject.personas)) {
                        skillPersonas += `${key}: Level ${value}\n`;
                    };
                };
                p5Embed
                    .setTitle(`${skillInput} (${capitalizeString(skillObject.element)})`)
                    .setDescription(skillObject.effect)
                    .addFields([{ name: "Personas:", value: skillPersonas, inline: false }]);
                break;
            case "trait":
                let traitInput = interaction.options.getString("trait");
                let traitObject = skillMapRoyal[traitInput];
                if (!traitObject || traitObject.element !== "trait") return sendMessage({ client: client, interaction: interaction, content: `Could not find that trait.` });
                let traitPersonas = Object.keys(traitObject.personas).join("\n");
                p5Embed
                    .setTitle(traitInput)
                    .setDescription(traitObject.effect)
                    .addFields([{ name: "Personas:", value: traitPersonas, inline: false }]);
                break;
            case "item":
                let itemInput = interaction.options.getString("item");
                let itemObject = itemMapRoyal[itemInput];
                if (!itemObject) return sendMessage({ client: client, interaction: interaction, content: `Could not find that item.` });
                if (itemObject.type && itemObject.description) {
                    p5Embed.addFields([{ name: itemObject.type, value: itemObject.description, inline: false }]);
                } else if (itemObject.skillCard) {
                    p5Embed.addFields([{ name: `Skill Card:`, value: `Teaches a Persona ${itemInput}.`, inline: false }]);
                };
                p5Embed.setTitle(itemInput);
        };
        return sendMessage({ client: client, interaction: interaction, embeds: p5Embed, ephemeral: ephemeral, components: buttonArray });

        function getWeaknessString(string) {
            string = string.replace("wk", "Weak").replace("rs", "Resist").replace("nu", "Null").replace("ab", "Absorb").replace("rp", "Repel").replace("-", "Neutral");
            return string;
        };
        function getItemString(string) {
            let itemObject = itemMapRoyal[string];
            if (!itemObject) return "None";
            if (itemObject.type && itemObject.description) {
                string = `${string} (${itemObject.type}): ${itemObject.description}`;
            } else if (itemObject.skillCard) {
                string = `${string} (Skill Card)`;
            };
            return string;
        };

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
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a specific Persona.",
        options: [{
            name: "persona",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify Persona by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "skill",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a skill.",
        options: [{
            name: "skill",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify skill by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "trait",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a trait.",
        options: [{
            name: "trait",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify trait by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "item",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on an item.",
        options: [{
            name: "item",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify item by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }]
};