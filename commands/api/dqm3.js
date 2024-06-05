import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import familiesJSON from "../../submodules/DQM3-db/objects/families.json" with { type: "json" };
import itemsJSON from "../../submodules/DQM3-db/objects/items.json" with { type: "json" };
// import largeDifferencesJSON from "../../submodules/DQM3-db/objects/largeDifferences.json" with { type: "json" };
import monstersJSON from "../../submodules/DQM3-db/objects/monsters.json" with { type: "json" };
// import resistancesJSON from "../../submodules/DQM3-db/objects/resistances.json" with { type: "json" };
import skillsJSON from "../../submodules/DQM3-db/objects/skills.json" with { type: "json" };
import talentsJSON from "../../submodules/DQM3-db/objects/talents.json" with { type: "json" };
import traitsJSON from "../../submodules/DQM3-db/objects/traits.json" with { type: "json" };
import synthesis from "../../submodules/DQM3-db/util/synthesis.js";

export default async (client, interaction, ephemeral) => {
    try {
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let inputID = null;
        let detailed = false;
        let detailedArg = interaction.options.getBoolean("detailed");
        if (detailedArg === true) detailed = true;

        let dqm3Embed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor);
        switch (interaction.options.getSubcommand()) {
            case "monster":
                inputID = interaction.options.getString("monster");
                let monsterData = monstersJSON[inputID];
                if (!monsterData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that monster.` });
                let monsterTitle = monsterData.name;
                if (monsterData.number) monsterTitle = `${monsterData.number}: ${monsterTitle}`; // Redundant check in complete dataset
                let growthString = ""; // Redundant check in complete dataset
                if (monsterData.growth) growthString = `HP: ${"⭐".repeat(monsterData.growth.hp)}\nMP: ${"⭐".repeat(monsterData.growth.mp)}\nAtk: ${"⭐".repeat(monsterData.growth.atk)}\nDef: ${"⭐".repeat(monsterData.growth.def)}\nAgi: ${"⭐".repeat(monsterData.growth.agi)}\nWis: ${"⭐".repeat(monsterData.growth.wis)}`;
                let innateTalentsString = "";
                if (monsterData.talents) { // Redundant check in complete dataset
                    monsterData.talents.forEach(talent => {
                        if (talentsJSON[talent]) innateTalentsString += `${talentsJSON[talent].name}\n`; // Check will be redundant in complete dataset
                    });
                };
                let monsterTraitsString = "";
                if (monsterData.traits) {
                    if (monsterData.traits.small) { // Check might be redundant in complete dataset, depending on if all monsters can be small and/or large
                        for (const [traitID, levelReq] of Object.entries(monsterData.traits.small)) {
                            if (traitsJSON[traitID]) monsterTraitsString += `${traitsJSON[traitID].name} (${levelReq})\n`;
                        };
                    };
                    if (monsterData.traits.large) { // Check might be redundant in complete dataset, depending on if all monsters can be small and/or large
                        monsterTraitsString += `**Large Traits:**\n`;
                        for (const [traitID, levelReq] of Object.entries(monsterData.traits.large)) {
                            if (traitsJSON[traitID]) monsterTraitsString += `${traitsJSON[traitID].name} (${levelReq})\n`;
                        };
                    };
                };
                dqm3Embed.setTitle(monsterTitle);
                if (monsterData.description) dqm3Embed.setDescription(monsterData.description);
                dqm3Embed.addFields([
                    { name: "Rank", value: monsterData.rank, inline: true },
                    { name: "Family", value: familiesJSON[monsterData.family].name, inline: true }
                ]);
                if (monsterData.talents) dqm3Embed.addFields([{ name: "Innate Talents:", value: innateTalentsString, inline: true }]);
                if (monsterData.traits) dqm3Embed.addFields([{ name: "Traits: (Lvl)", value: monsterTraitsString, inline: true }]);
                if (monsterData.growth) dqm3Embed.addFields([{ name: "Growth:", value: growthString, inline: false }]);
                if (detailed) {
                    dqm3Embed.addFields([
                        { name: "Talent Pool:", value: "Coming soon.", inline: true },
                        { name: "Habitat:", value: "Coming soon.", inline: true },
                        { name: "Resistances:", value: "Coming soon.", inline: true }
                    ]);
                };
                break;
            case "talent":
                inputID = interaction.options.getString("talent");
                let talentData = talentsJSON[inputID];
                if (!talentData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that talent.` });
                let talentSkillsString = "";
                if (talentData.skills) {
                    for (const [skillID, skillPoints] of Object.entries(talentData.skills)) {
                        if (skillsJSON[skillID]) talentSkillsString += `${skillsJSON[skillID].name} (${skillPoints})\n`;
                    };
                };
                let talentTraitsString = "";
                if (talentData.traits) {
                    for (const [traitID, traitPoints] of Object.entries(talentData.traits)) {
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
                dqm3Embed.setTitle(talentData.name);
                if (talentSkillsString.length > 0) dqm3Embed.addFields([{ name: "Skills: (Required points)", value: talentSkillsString, inline: true }]);
                if (talentTraitsString.length > 0) dqm3Embed.addFields([{ name: "Traits: (Required points)", value: talentTraitsString, inline: true }]);
                if (talentMonstersString.length > 0) dqm3Embed.addFields([{ name: "Monsters:", value: talentMonstersString, inline: false }]);
                break;
            case "skill":
                inputID = interaction.options.getString("skill");
                let skillData = skillsJSON[inputID];
                if (!skillData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that skill.` });
                let mpCostString = skillData.mp_cost.toString();
                if (skillData.mp_cost < 0) mpCostString = `${skillData.mp_cost * -100}%`;
                let skillTalents = [];
                for (const [talentID, talentObject] of Object.entries(talentsJSON)) {
                    if (talentObject.skills == null) continue;
                    if (Object.keys(talentObject.skills).includes(inputID)) skillTalents.push(`${talentObject.name} (${talentObject.skills[inputID]})`);
                };
                dqm3Embed
                    .setTitle(skillData.name)
                    .setDescription(skillData.description)
                    .addFields([{ name: "Type:", value: skillData.type, inline: true }])
                    .addFields([{ name: "MP Cost:", value: mpCostString, inline: true }]);
                if (skillTalents.length > 0) dqm3Embed.addFields([{ name: "Talents:", value: skillTalents.join("\n"), inline: false }]);
                break;
            case "trait":
                inputID = interaction.options.getString("trait");
                let traitData = traitsJSON[inputID];
                if (!traitData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that trait.` });
                let traitMonsters = [];
                for (const [monsterID, monsterObject] of Object.entries(monstersJSON)) {
                    if (monsterObject.traits == null) continue;
                    if (monsterObject.traits.small && Object.keys(monsterObject.traits.small).includes(inputID)) traitMonsters.push(monsterObject.name);
                    if (monsterObject.traits.large && Object.keys(monsterObject.traits.large).includes(inputID)) traitMonsters.push(`${monsterObject.name} (L)`);
                };
                let traitTalents = [];
                for (const [talentID, talentObject] of Object.entries(talentsJSON)) {
                    if (talentObject.traits == null) continue;
                    if (Object.keys(talentObject.traits).includes(inputID)) traitTalents.push(`${talentObject.name} (${talentObject.traits[inputID]})`);
                };
                dqm3Embed
                    .setTitle(traitData.name)
                    .setDescription(traitData.description);
                if (traitMonsters.length > 0) dqm3Embed.addFields([{ name: "Monsters:", value: traitMonsters.join("\n"), inline: false }]);
                if (traitTalents.length > 0) dqm3Embed.addFields([{ name: "Talents:", value: traitTalents.join("\n"), inline: false }]);
                break;
            case "item":
                inputID = interaction.options.getString("item");
                let itemData = itemsJSON[inputID];
                if (!itemData) return sendMessage({ client: client, interaction: interaction, content: `Could not find that item.` });
                dqm3Embed
                    .setTitle(itemData.name)
                    .setDescription(itemData.description)
                    .addFields([{ name: "Type:", value: itemData.type, inline: true }]);
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
                        .setTitle("Synthesis")
                        .setDescription(`${parent1Name} + ${parent2Name} = ${targetName}`);
                    if (familySynthesisString.length > 0) dqm3Embed.addFields([{ name: "Family Synthesis:", value: `${familySynthesisString}\n${familySynthesisNote}`, inline: false }]);
                    if (uniqueSynthesisString.length > 0) dqm3Embed.addFields([{ name: "Unique Synthesis:", value: uniqueSynthesisString, inline: false }]);
                    dqm3Embed.setFooter({ text: "Note: Monsters can always synthesize into their own species." });
                } else {
                    return sendMessage({ client: client, interaction: interaction, content: `Coming soon.` });
                };
                break;
        };
        return sendMessage({ client: client, interaction: interaction, embeds: dqm3Embed, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "dqm3",
    description: `Shows Dragon Quest Monsters 3: The Dark Prince data.`,
    options: [{
        name: "monster",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a monster.",
        options: [{
            name: "monster",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify monster by name.",
            autocomplete: true,
            required: true
        }, {
            name: "detailed",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Show detailed info."
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "talent",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a talent",
        options: [{
            name: "talent",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify talent by name.",
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
    }, {
        name: "synthesis",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Calculate synthesis.",
        options: [{
            name: "parent1",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify parent by name.",
            autocomplete: true
        }, {
            name: "parent2",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify parent by name.",
            autocomplete: true
        }, {
            name: "target",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify target by name.",
            autocomplete: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }]
};