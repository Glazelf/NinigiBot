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
                let monsterTitle = monsterData.name;
                if (monsterData.number) monsterTitle = `${monsterData.number}: ${monsterTitle}`; // Redundant check in complete dataset
                if (!monsterData.description) monsterData.description = "No description available in the demo.";
                let growthString = "Monster is unscoutable in the demo."; // Redundant check in complete dataset
                if (monsterData.growth) growthString = `HP: ${"⭐".repeat(monsterData.growth.hp)}\nMP: ${"⭐".repeat(monsterData.growth.mp)}\nAtk: ${"⭐".repeat(monsterData.growth.atk)}\nDef: ${"⭐".repeat(monsterData.growth.def)}\nAgi: ${"⭐".repeat(monsterData.growth.agi)}\nWis: ${"⭐".repeat(monsterData.growth.wis)}`;
                let innateTalentsString = "";
                if (monsterData.talents) { // Redundant check in complete dataset
                    monsterData.talents.forEach(talent => {
                        if (talentsJSON[talent]) innateTalentsString += `${talentsJSON[talent].name}\n`; // Check will be redundant in complete dataset
                    });
                } else {
                    innateTalentsString = "Monster is unscoutable in the demo.";
                };
                if (innateTalentsString.length < 1) innateTalentsString = "The talents this monster has have not yet been properly documented."; // Check will be redundant in complete dataset
                let monsterTraitsString = "";
                if (monsterData.traits) {
                    if (monsterData.traits.small) { // Check might be redundant in complete dataset, depending on if all monsters can be small and/or large
                        for ([traitID, levelReq] of Object.entries(monsterData.traits.small)) {
                            if (traitsJSON[traitID]) monsterTraitsString += `${traitsJSON[traitID].name} (${levelReq})\n`;
                        };
                    };
                    if (monsterData.traits.large) { // Check might be redundant in complete dataset, depending on if all monsters can be small and/or large
                        monsterTraitsString += `**Large Traits:**\n`;
                        for ([traitID, levelReq] of Object.entries(monsterData.traits.large)) {
                            if (traitsJSON[traitID]) monsterTraitsString += `${traitsJSON[traitID].name} (${levelReq})\n`;
                        };
                    };
                } else {
                    monsterTraitsString = "Monster is unscoutable in the demo.";
                };
                dqm3Embed
                    .setAuthor({ name: monsterTitle })
                    .setDescription(monsterData.description)
                    .addField("Rank:", monsterData.rank, true)
                    .addField("Family:", familiesJSON[monsterData.family].name, true)
                    .addField("Innate Talents:", innateTalentsString, true)
                    .addField("Traits: (Lvl)", monsterTraitsString, true)
                    .addField("Growth:", growthString, false);
                if (detailed) {
                    dqm3Embed
                        .addField("Talent Pool:", "Coming soon.", true)
                        .addField("Habitat:", "Coming soon.", false)
                        .addField("Resistances:", "Coming soon.", true);
                };
                break;
            case "talent":
                inputID = interaction.options.getString("talent");
                let talentData = talentsJSON[inputID];
                if (!talentData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that talent.` });
                let talentSkillsString = "";
                if (talentData.skills) {
                    for (let [skillID, skillPoints] of Object.entries(talentData.skills)) {
                        if (skillsJSON[skillID]) talentSkillsString += `${skillsJSON[skillID].name} (${skillPoints})\n`;
                    };
                };
                let talentTraitsString = "";
                if (talentData.traits) {
                    for (let [traitID, traitPoints] of Object.entries(talentData.traits)) {
                        let traitsLevels = traitPoints.join(", ");
                        if (traitsJSON[traitID]) talentTraitsString += `${traitsJSON[traitID].name} (${traitsLevels})\n`;
                    };
                };
                let talentMonstersString = "";
                let talentMonstersArray = [];
                let talentMonsters = await Object.entries(monstersJSON).filter(monster => {
                    if (!monster[1].talents) return false; // Check might be redundant in complete dataset
                    return monster[1].talents.includes(inputID);
                });
                talentMonsters.forEach(monster => {
                    talentMonstersArray.push(monstersJSON[monster[0]].name);
                });
                talentMonstersString = talentMonstersArray.join(", ");
                dqm3Embed
                    .setAuthor({ name: talentData.name })
                if (talentSkillsString.length > 0) dqm3Embed.addField("Skills: (Required points)", talentSkillsString, true);
                if (talentTraitsString.length > 0) dqm3Embed.addField("Traits: (Required points)", talentTraitsString, true);
                if (talentMonstersString.length > 0) dqm3Embed.addField("Monsters:", talentMonstersString, false);
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
                    .addField("Type:", skillData.type, true)
                    .addField("MP Cost:", mpCostString, true);
                break;
            case "trait":
                inputID = interaction.options.getString("trait");
                let traitData = traitsJSON[inputID];
                if (!traitData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that trait.` });
                dqm3Embed
                    .setAuthor({ name: traitData.name })
                    .setDescription(traitData.description);
                break;
            case "item":
                inputID = interaction.options.getString("item");
                let itemData = itemsJSON[inputID];
                if (!itemData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that item.` });
                dqm3Embed
                    .setAuthor({ name: itemData.name })
                    .setDescription(itemData.description)
                    .addField("Type:", itemData.type, true);
                break;
            case "spawn":
                inputID = interaction.options.getString("area");
                let areaData = areasJSON[inputID];
                if (!areaData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that area.` });
                return sendMessage({ client: client, interaction: interaction, content: `Coming soon.` });
                break;
            case "synthesis":
                let parent1 = interaction.options.getString("parent1");
                let parent2 = interaction.options.getString("parent2");
                let target = interaction.options.getString("target");
                let parent1Data = monstersJSON[parent1];
                let parent2Data = monstersJSON[parent2];
                let targetData = monstersJSON[target];
                let parent1Name = "???";
                let parent2Name = "???";
                let targetName = "???";
                if (parent1Data) parent1Name = `${parent1Data.name} (${parent1Data.rank})`;
                if (parent2Data) parent2Name = `${parent2Data.name} (${parent2Data.rank})`;
                if (targetData) targetName = `${targetData.name} (${targetData.rank})`;
                let synthesisResult = await synthesis({ parents: [parent1, parent2], target: target });
                if (!synthesisResult.routes) {
                    let familySynthesisString = "";
                    let uniqueSynthesisString = "";
                    let familySynthesisNote = "Note: For synthesis between two families, at least one of the parents needs to match the target's rank.";
                    if (synthesisResult.familySynthesis) {
                        let familyResults = [];
                        synthesisResult.familySynthesis.forEach(result => {
                            if (typeof result === "object") {
                                for (let i = 0; i < result.length; i++) {
                                    familyResults[i] = familiesJSON[result[i]].name;
                                };
                                familySynthesisString += `${familyResults[0]} + ${familyResults[1]}\n`;
                            } else {
                                familySynthesisString += `${monstersJSON[result].name}\n`;
                            };
                        });
                    };
                    if (synthesisResult.uniqueSynthesis) {
                        let uniqueResults = [];
                        synthesisResult.uniqueSynthesis.forEach(result => {
                            if (typeof result === "object") {
                                for (let i = 0; i < result.length; i++) {
                                    if (result[i].startsWith("_")) {
                                        uniqueResults[i] = familiesJSON[result[i]].name;
                                        continue;
                                    } else {
                                        uniqueResults[i] = monstersJSON[result[i]].name;
                                        continue;
                                    };
                                };
                                uniqueSynthesisString += `${uniqueResults[0]} + ${uniqueResults[1]}\n`;
                            } else {
                                if (result.startsWith("_")) {
                                    uniqueSynthesisString += `${familiesJSON[result].name}\n`;
                                } else {
                                    uniqueSynthesisString += `${monstersJSON[result].name}\n`;
                                };
                            };
                        });
                    };
                    dqm3Embed
                        .setAuthor({ name: "Synthesis" })
                        .setDescription(`${parent1Name} + ${parent2Name} = ${targetName}`);
                    if (familySynthesisString.length > 0) dqm3Embed.addField("Family Synthesis:", `${familySynthesisString}\n${familySynthesisNote}`, false);
                    if (uniqueSynthesisString.length > 0) dqm3Embed.addField("Unique Synthesis:", uniqueSynthesisString, false);
                    dqm3Embed.setFooter({ text: "Note: Monsters can always synthesize into their own species." });
                } else {
                    return sendMessage({ client: client, interaction: interaction, content: `Coming soon.` });
                };
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
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};
