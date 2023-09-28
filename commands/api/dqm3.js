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
        const monstersJSON = require("../../submodules/DQM3-db/objects/monsters.json");
        const skillsJSON = require("../../submodules/DQM3-db/objects/skills.json");
        const talentsJSON = require("../../submodules/DQM3-db/objects/talents.json");
        const traitsJSON = require("../../submodules/DQM3-db/objects/traits.json");

        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;

        let inputID;
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
                let growthString = `HP: ${"⭐".repeat(monsterData.growth.hp)}\nMP: ${"⭐".repeat(monsterData.growth.mp)}\nAttack: ${"⭐".repeat(monsterData.growth.atk)}\nDefense: ${"⭐".repeat(monsterData.growth.def)}\nAgility: ${"⭐".repeat(monsterData.growth.agi)}\nWisdom: ${"⭐".repeat(monsterData.growth.wis)}`;
                dqm3Embed
                    .setAuthor({ name: `${monsterData.name} (${monsterData.rank})` })
                    .setDescription(monsterData.description)
                    .addField("Innate Talents:", talentsJSON[monsterData.talents[0]].name, true)
                    .addField("Growth:", growthString, false)
                if (detailed) dqm3Embed.addField("Talent Pool:", "Coming Soon", true)
                    .addField("Habitat:", "Coming Soon", false)
                if (detailed) dqm3Embed.addField("Resistances:", "Coming Soon", true);
                break;
            case "talent":
                break;
            case "skill":
                break;
            case "trait":
                break;
            case "item":
                break;
            case "spawn":
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