import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import fs from "fs";
import sendMessage from "../../util/sendMessage.js";
import capitalizeString from "../../util/capitalizeString.js";
import getWikiURL from "../../util/getWikiURL.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

let personaWiki = "https://static.wikia.nocookie.net/megamitensei/images/";
// rarePersonaeRoyal; list of treasure Persona
// rareCombosRoyal; ??
// arcana2CombosRoyal; arcana fusion combos
// specialCombosRoyal; special fusions
// dlcPersonaRoyal; list of DLC Persona names
// let rarePersonaeRoyal, rareCombosRoyal, arcana2CombosRoyal, specialCombosRoyal, dlcPersonaRoyal, inheritanceChartRoyal;
// eval(fs.readFileSync("submodules/persona5_calculator/data/Data5Royal.js", "utf8").replace(/var /g, ""));
let itemMapRoyal; // Object including all item names mapped to item type/descriptions
eval(fs.readFileSync("submodules/persona5_calculator/data/ItemDataRoyal.js", "utf8").replace("var", ""));
let personaMapRoyal; // Object including all persona data (incl. DLC)
eval(fs.readFileSync("submodules/persona5_calculator/data/PersonaDataRoyal.js", "utf8").replace("var", ""));
let skillMapRoyal; // Object including all skill AND trait data
eval(fs.readFileSync("submodules/persona5_calculator/data/SkillDataRoyal.js", "utf8").replace("var", ""));

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    let buttonArray = [];

    let p5Embed = new EmbedBuilder()
        .setColor(globalVars.embedColor);

    switch (interaction.options.getSubcommand()) {
        case "persona":
            // TODO: use calculator to calc paths to fuse this monster
            let personaInput = interaction.options.getString("persona");
            let personaObject = personaMapRoyal[personaInput];
            if (!personaObject) return sendMessage({ interaction: interaction, content: `Could not find that Persona.` });
            let personaWikiName = personaInput.replace(/ /g, "_");
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
                .setImage(personaImage)
                .addFields([
                    { name: "Stats:", value: `Trait: ${personaObject.trait}\nLevel: ${personaObject.level}\n${personaStats}`, inline: true },
                    { name: "Skills:", value: personaSkills, inline: true },
                    { name: "Item:", value: personaItem, inline: false },
                    { name: "Item (Fusion Alarm):", value: personaItemAlarm, inline: false }
                ]);
            break;
        case "skill":
            let skillInput = interaction.options.getString("skill");
            let skillObject = skillMapRoyal[skillInput];
            if (!skillObject || skillObject.element == "trait") return sendMessage({ interaction: interaction, content: `Could not find that skill.` });
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
            if (!traitObject || traitObject.element !== "trait") return sendMessage({ interaction: interaction, content: `Could not find that trait.` });
            let traitPersonas = Object.keys(traitObject.personas).join("\n");
            p5Embed
                .setTitle(traitInput)
                .setDescription(traitObject.effect)
                .addFields([{ name: "Personas:", value: traitPersonas, inline: false }]);
            break;
        case "item":
            let itemInput = interaction.options.getString("item");
            let itemObject = itemMapRoyal[itemInput];
            if (!itemObject) return sendMessage({ interaction: interaction, content: `Could not find that item.` });
            if (itemObject.type && itemObject.description) {
                p5Embed.addFields([{ name: itemObject.type, value: itemObject.description, inline: false }]);
            } else if (itemObject.skillCard) {
                p5Embed.addFields([{ name: `Skill Card:`, value: `Teaches a Persona ${itemInput}.`, inline: false }]);
            };
            p5Embed.setTitle(itemInput);
    };
    return sendMessage({ interaction: interaction, embeds: p5Embed, ephemeral: ephemeral, components: buttonArray });
};

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

// String options
const personaOption = new SlashCommandStringOption()
    .setName("persona")
    .setDescription("Specify Persona by name.")
    .setAutocomplete(true)
    .setRequired(true);
const skillOption = new SlashCommandStringOption()
    .setName("skill")
    .setDescription("Specify skill by name.")
    .setAutocomplete(true)
    .setRequired(true);
const traitOption = new SlashCommandStringOption()
    .setName("trait")
    .setDescription("Specify trait by name.")
    .setAutocomplete(true)
    .setRequired(true);
const itemOption = new SlashCommandStringOption()
    .setName("item")
    .setDescription("Specify item by name.")
    .setAutocomplete(true)
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const personaSubcommand = new SlashCommandSubcommandBuilder()
    .setName("persona")
    .setDescription("Get info on a Persona.")
    .addStringOption(personaOption)
    .addBooleanOption(ephemeralOption);
const skillSubcommand = new SlashCommandSubcommandBuilder()
    .setName("skill")
    .setDescription("Get info on a skill.")
    .addStringOption(skillOption)
    .addBooleanOption(ephemeralOption);
const traitSubcommand = new SlashCommandSubcommandBuilder()
    .setName("trait")
    .setDescription("Get info on a trait.")
    .addStringOption(traitOption)
    .addBooleanOption(ephemeralOption);
const itemSubcommand = new SlashCommandSubcommandBuilder()
    .setName("item")
    .setDescription("Get info on an item.")
    .addStringOption(itemOption)
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("persona5")
    .setDescription("Shows Persona 5 data.")
    .addSubcommand(personaSubcommand)
    .addSubcommand(skillSubcommand)
    .addSubcommand(traitSubcommand)
    .addSubcommand(itemSubcommand);