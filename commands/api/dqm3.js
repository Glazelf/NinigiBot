exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const getWikiURL = require('../../util/getWikiURL');
        const parseDate = require('../../util/parseDate');
        const capitalizeString = require('../../util/capitalizeString');
        const areasJSON = require("../../submodules/DQM3-db/objects/areas.json");
        const familiesJSON = require("../../submodules/DQM3-db/objects/families.json");
        const itemsJSON = require("../../submodules/DQM3-db/objects/items.json");
        const largeDifferencesJSON = require("../../submodules/DQM3-db/objects/largeDifferences.json");
        const monstersJSON = require("../../submodules/DQM3-db/objects/monsters.json");
        const resistancesJSON = require("../../submodules/DQM3-db/objects/resistances.json");
        const skillsJSON = require("../../submodules/DQM3-db/objects/skills.json");
        const talentsJSON = require("../../submodules/DQM3-db/objects/talents.json");
        const traitsJSON = require("../../submodules/DQM3-db/objects/traits.json");
        const synthesis = require("../../submodules/DQM3-db/util/synthesis");

        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;
        let inputID = null;
        let detailed = false;
        let detailedArg = interaction.options.getBoolean("detailed");
        if (detailedArg === true) detailed = true;

        let dqm3Embed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);
        switch (interaction.options.getSubcommand()) {
            case "monster":
                inputID = interaction.options.getString("monster");
                let monsterData = monstersJSON[inputID];
                if (!monsterData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that monster.` });
                if (!monsterData.description) monsterData.description = "No description available in the demo.";
                let growthString = `HP: ${"⭐".repeat(monsterData.growth.hp)}\nMP: ${"⭐".repeat(monsterData.growth.mp)}\nAtk: ${"⭐".repeat(monsterData.growth.atk)}\nDef: ${"⭐".repeat(monsterData.growth.def)}\nAgi: ${"⭐".repeat(monsterData.growth.agi)}\nWis: ${"⭐".repeat(monsterData.growth.wis)}`;
                let innateTalentsString = "";
                let innateTalents = monsterData.talents.forEach(talent => {
                    if (talentsJSON[talent]) innateTalentsString += `${talentsJSON[talent].name}\n`; // Check will be redundant in complete dataset
                });
                dqm3Embed
                    .setAuthor({ name: `${monsterData.number}: ${monsterData.name} (${monsterData.rank})` })
                    .setDescription(monsterData.description);
                if (innateTalentsString.length > 0) dqm3Embed.addField("Innate Talents:", innateTalentsString, true); // Check will be redundant in complete dataset
                dqm3Embed.addField("Growth:", growthString, false);
                if (detailed) {
                    qm3Embed
                        .addField("Talent Pool:", "Coming soon", true)
                        .addField("Habitat:", "Coming Soon", false)
                        .addField("Resistances:", "Coming Soon", true);
                };
                break;
            case "talent":
                inputID = interaction.options.getString("talent");
                let talentData = talentsJSON[inputID];
                if (!talentData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that talent.` });
                break;
            case "skill":
                inputID = interaction.options.getString("skill");
                let skillData = skillsJSON[inputID];
                if (!skillData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that skill.` });
                let mpCostString = skillData.mp_cost.toString();
                if (skillData.mp_cost < 0) mpCostString = `${skillData.mp_cost * -100}%`;
                dqm3Embed
                    .setAuthor({ name: skillData.name })
                    .setDescription(skillData.description)
                    .addField("Type", skillData.type, true)
                    .addField("MP Cost", mpCostString, true);
                break;
            case "trait":
                inputID = interaction.options.getString("trait");
                let traitData = traitsJSON[inputID];
                if (!traitData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that trait.` });
                break;
            case "item":
                inputID = interaction.options.getString("item");
                let itemData = itemsJSON[inputID];
                if (!itemData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that item.` });
                break;
            case "spawn":
                inputID = interaction.options.getString("area");
                let areaData = areasJSON[inputID];
                if (!areaData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that area.` });
                break;
            case "synthesis":
                break;
        };
        return sendMessage({ client: client, interaction: interaction, embeds: dqm3Embed, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "dqm3",
    description: `Shows Dragon Quest Monsters 3: The Dark Prince data.`,
    options: [{
        name: "monster",
        type: "SUB_COMMAND",
        description: "Get info on a monster.",
        options: [{
            name: "monster",
            type: "STRING",
            description: "Specify monster by name.",
            autocomplete: true,
            required: true
        }, {
            name: "detailed",
            type: "BOOLEAN",
            description: "Show detailed info."
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "talent",
        type: "SUB_COMMAND",
        description: "Get info on a talent",
        options: [{
            name: "talent",
            type: "STRING",
            description: "Specify talent by name.",
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
    }, {
        name: "item",
        type: "SUB_COMMAND",
        description: "Get info on an item.",
        options: [{
            name: "item",
            type: "STRING",
            description: "Specify item by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "spawn",
        type: "SUB_COMMAND",
        description: "Get spawns in an area.",
        options: [{
            name: "area",
            type: "STRING",
            description: "Specify area by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "synthesis",
        type: "SUB_COMMAND",
        description: "Calculate synthesis.",
        options: [{
            name: "parent1",
            type: "STRING",
            description: "Specify parent by name.",
            autocomplete: true
        }, {
            name: "parent2",
            type: "STRING",
            description: "Specify parent by name.",
            autocomplete: true
        }, {
            name: "target",
            type: "STRING",
            description: "Specify target by name.",
            autocomplete: true
        }, {
            name: "talent1",
            type: "STRING",
            description: "Specify talent by name.",
            autocomplete: true
        }, {
            name: "talent2",
            type: "STRING",
            description: "Specify talent by name.",
            autocomplete: true
        }, {
            name: "talent3",
            type: "STRING",
            description: "Specify talent by name.",
            autocomplete: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};