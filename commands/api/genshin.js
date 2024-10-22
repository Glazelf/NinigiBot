import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import axios from "axios";
import sendMessage from "../../util/sendMessage.js";
import parseDate from "../../util/parseDate.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const giAPI = `https://genshin.jmp.blue/`;
const embedCharacterLimit = 6000;
const descCharacterLimit = 1024;

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });

    let response;
    let error200ReturnString = `Error occurred, make sure that your input is valid and exists.`;
    let returnString = "";
    let giEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    let nameInput = interaction.options.getString("name").toLowerCase();
    switch (interaction.options.getSubcommand()) {
        case "character":
            const giAPICharacter = `${giAPI}characters/${nameInput}`;
            let skillsBool = false;
            let passivesBool = false;
            let constellationsBool = false;
            if (interaction.options.getBoolean("skills") === true) skillsBool = true;
            if (interaction.options.getBoolean("passives") === true) passivesBool = true;
            if (interaction.options.getBoolean("constellations") === true) constellationsBool = true;
            response = await axios.get(giAPICharacter);
            if (response.status != 200) return sendMessage({ interaction: interaction, content: error200ReturnString });
            let character = response.data;
            // We should REALLY change how birthdays are stored LOL
            let characterBirthdayArray = [];
            let characterBirthday = "";
            if (character.birthday) {
                characterBirthdayArray = character.birthday.split("-");
                characterBirthday = parseDate(`${characterBirthdayArray[2]}${characterBirthdayArray[1]}`);
            };
            giEmbed
                .setAuthor({ name: `${character.name} - ${character.affiliation}`, iconURL: `${giAPICharacter}/icon-side` })
                .setThumbnail(`${giAPICharacter}/constellation-shape`)
                .setImage(`${giAPICharacter}/gacha-splash`)
                .addFields([
                    { name: "Rarity:", value: `${character.rarity}⭐`, inline: true },
                    { name: "Vision:", value: character.vision, inline: true },
                    { name: "Weapon:", value: character.weapon, inline: true }
                ]);
            if (character.description) giEmbed.setDescription(character.description);
            if (character.birthday) giEmbed.addFields([{ name: "Birthday:", value: characterBirthday, inline: true }]);
            // Every (most) characters have 3 active and 3 passive skills and 6 constellations, making 12 fields
            if (skillsBool) {
                for (const skill of character.skillTalents) {
                    giEmbed.addFields(getCharacterAttributeFields(skill, "Skill", giEmbed.length));
                };
            };
            if (passivesBool) {
                for (const passive of character.passiveTalents) {
                    giEmbed.addFields(getCharacterAttributeFields(passive, "Passive", giEmbed.length));
                };
            };
            if (constellationsBool) {
                for (const constellation of character.constellations) {
                    giEmbed.addFields(getCharacterAttributeFields(constellation, "Constellation", giEmbed.length));
                };
            };
            if (giEmbed.length > embedCharacterLimit - descCharacterLimit) returnString = `Embeds can only be ${embedCharacterLimit} characters long.\nIf you are missing fields they might have gone over this limit and not been added.\nTry selecting less attributes to display (\`skills\`, \`passives\`, \`constellations\`) at once.`;
            break;
        case "weapon":
            const giAPIWeapon = `${giAPI}weapons/${nameInput}`;
            response = await axios.get(giAPIWeapon);
            if (response.status != 200) return sendMessage({ interaction: interaction, content: error200ReturnString });
            let weapon = response.data;
            giEmbed
                .setTitle(weapon.name)
                .setThumbnail(`${giAPIWeapon}/icon`)
                .addFields([
                    { name: "Type:", value: `${weapon.rarity}⭐ ${weapon.type}`, inline: true },
                    { name: "Location:", value: weapon.location, inline: true },
                    { name: "Base Attack:", value: weapon.baseAttack.toString(), inline: true },
                ]);
            if (weapon.subStat !== "-") giEmbed.addFields([{ name: "Substat:", value: weapon.subStat, inline: true }]);
            if (weapon.passiveName !== "-") giEmbed.addFields([{ name: `${weapon.passiveName} (Passive)`, value: weapon.passiveDesc, inline: false }]);
            break;
        case "artifact":
            const giAPIArtifact = `${giAPI}artifacts/${nameInput}`;
            response = await axios.get(giAPIArtifact);
            if (response.status != 200) return sendMessage({ interaction: interaction, content: error200ReturnString });
            let artifact = response.data;
            giEmbed
                .setTitle(artifact.name)
                .setThumbnail(`${giAPIArtifact}/flower-of-life`)
                .addFields([{ name: "Max Rarity:", value: `${artifact.max_rarity}⭐`, inline: true }]);
            let pieceBonusVarName = "-piece_bonus";
            for (let i = 1; i <= 5; i++) {
                if (artifact[`${i}${pieceBonusVarName}`]) giEmbed.addFields([{ name: `${i}-Piece Bonus:`, value: artifact[`${i}${pieceBonusVarName}`] }]);
            };
            break;
    };
    return sendMessage({ interaction: interaction, content: returnString, embeds: giEmbed, ephemeral: ephemeral });
};

function getCharacterAttributeFields(attribute, type, embedCharacterLength) {
    let attributeDesc = attribute.description.replace("\n\n", "\n");
    let descSplit = "...";
    let descMaxLength = descCharacterLimit - descSplit.length;
    let fields = [];
    if (attributeDesc.length <= descCharacterLimit) {
        fields.push({ name: `${attribute.name} (${type})`, value: attributeDesc, inline: false });
    } else {
        fields = fields.concat([
            { name: `${attribute.name} (${type})`, value: `${attributeDesc.substring(0, descMaxLength)}${descSplit}`, inline: false },
            { name: `${attribute.name} (${type}) (cont.)`, value: `${descSplit}${attributeDesc.substring(descMaxLength,)}`, inline: false }
        ]);
    };
    for (const field of fields) {
        embedCharacterLength = embedCharacterLength + field.name.length + field.value.length;
    };
    if (embedCharacterLength > embedCharacterLimit) fields = [];
    return fields;
};

// String options
const characterOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Specify character by name.")
    .setAutocomplete(true)
    .setRequired(true);
const weaponOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Specify weapon by name.")
    .setAutocomplete(true)
    .setRequired(true);
const artifactOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Specify artifact by name.")
    .setAutocomplete(true)
    .setRequired(true);
// Boolean options
const skillOption = new SlashCommandBooleanOption()
    .setName("skills")
    .setDescription("Whether to show skill info.");
const passiveOption = new SlashCommandBooleanOption()
    .setName("passives")
    .setDescription("Whether to show passive info.");
const constellationOption = new SlashCommandBooleanOption()
    .setName("constellations")
    .setDescription("Whether to show constellation info.");
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const characterSubcommand = new SlashCommandSubcommandBuilder()
    .setName("character")
    .setDescription("Get info on a character.")
    .addStringOption(characterOption)
    .addBooleanOption(skillOption)
    .addBooleanOption(passiveOption)
    .addBooleanOption(constellationOption)
    .addBooleanOption(ephemeralOption);
const weaponSubcommand = new SlashCommandSubcommandBuilder()
    .setName("weapon")
    .setDescription("Get info on a weapon.")
    .addStringOption(weaponOption)
    .addBooleanOption(ephemeralOption);
const artifactSubcommand = new SlashCommandSubcommandBuilder()
    .setName("artifact")
    .setDescription("Get info on an artifact.")
    .addStringOption(artifactOption)
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("genshin")
    .setDescription("Shows Genshin Impact info.")
    .addSubcommand(characterSubcommand)
    .addSubcommand(weaponSubcommand)
    .addSubcommand(artifactSubcommand);