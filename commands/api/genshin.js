import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import axios from "axios";
import sendMessage from "../../util/sendMessage.js";
import getWikiURL from "../../util/getWikiURL.js";
import parseDate from "../../util/parseDate.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

let giAPI = `https://genshin.jmp.blue/`;
let giWiki = `https://static.wikia.nocookie.net/gensin-impact/images/`;

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });

    let response;
    let giEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    let nameInput = interaction.options.getString("name").toLowerCase();
    switch (interaction.options.getSubcommand()) {
        case "character":
            giAPI += `characters/`;
            let detailed = false;
            let detailedArg = interaction.options.getBoolean("detailed");
            if (detailedArg === true) detailed = true;
            response = await axios.get(giAPI + nameInput);
            if (response.status != 200) return sendMessage({ interaction: interaction, content: `Error occurred, make sure that character exists.` });
            let character = response.data;
            let characterThumbnailFile = `Character_${character.name}_Thumb.png`;
            let characterThumbnail = getWikiURL(characterThumbnailFile, giWiki);
            let characterBannerFile = `Character_${character.name}_Full_Wish.png`;
            let characterBanner = getWikiURL(characterBannerFile, giWiki);
            // We should REALLY change how birthdays are stored LOL
            let characterBirthdayArray = [];
            let characterBirthday = "";
            if (character.birthday) {
                characterBirthdayArray = character.birthday.split("-");
                characterBirthday = parseDate(`${characterBirthdayArray[2]}${characterBirthdayArray[1]}`);
            };
            giEmbed
                .setTitle(`${character.name} - ${character.affiliation}`)
                .setThumbnail(characterThumbnail)
                .setImage(characterBanner)
                .addFields([
                    { name: "Rarity:", value: `${character.rarity}⭐`, inline: true },
                    { name: "Vision:", value: character.vision, inline: true },
                    { name: "Weapon:", value: character.weapon, inline: true }
                ]);
            if (character.description) giEmbed.setDescription(character.description);
            if (character.birthday) giEmbed.addFields([{ name: "Birthday:", value: characterBirthday, inline: true }]);
            if (detailed) {
                // All three of these functions can probably be combined better but whatever
                // Every (most) characters have 3 active and 3 passive skills and 6 constellations, making 12 fields
                await character.skillTalents.forEach(skill => {
                    let skillDesc = skill.description.replace("\n\n", "\n");
                    let descCharacterLimit = 1024;
                    if (skillDesc.length <= descCharacterLimit) {
                        giEmbed.addFields([{ name: `${skill.name} (Active)`, value: skillDesc, inline: false }]);
                    } else {
                        giEmbed.addFields([
                            { name: `${skill.name} (Active)`, value: `${skillDesc.substring(0, descCharacterLimit)}...`, inline: false },
                            { name: `${skill.name} (Active) (cont.)`, value: `...${skillDesc.substring(descCharacterLimit,)}`, inline: false }
                        ]);
                    };
                });
                await character.passiveTalents.forEach(passive => {
                    giEmbed.addFields([{ name: `${passive.name} (Passive)`, value: `${passive.unlock}\n${passive.description.replace("\n\n", "\n")}`, inline: false }]);

                });
                await character.constellations.forEach(constellation => {
                    giEmbed.addFields([{ name: `${constellation.name} (${constellation.unlock})`, value: constellation.description.replace("\n\n", "\n"), inline: false }]);
                });
            };
            break;
        case "weapon":
            giAPI += `weapons/`;
            response = await axios.get(giAPI + nameInput);
            let weapon = response.data;

            let weaponThumbnailFile = `Weapon_${weapon.name}.png`;
            let weaponThumbnail = getWikiURL(weaponThumbnailFile, giWiki);
            giEmbed
                .setTitle(weapon.name)
                .setThumbnail(weaponThumbnail)
                .addFields([
                    { name: "Type:", value: `${weapon.rarity}⭐ ${weapon.type}`, inline: true },
                    { name: "Location:", value: weapon.location, inline: true },
                    { name: "Base Attack:", value: weapon.baseAttack.toString(), inline: true },
                ]);
            if (weapon.subStat !== "-") giEmbed.addFields([{ name: "Substat:", value: weapon.subStat, inline: true }]);
            if (weapon.passiveName !== "-") giEmbed.addFields([{ name: `${weapon.passiveName} (Passive)`, value: weapon.passiveDesc, inline: false }]);
            break;
        case "artifact":
            giAPI += `artifacts/`;
            response = await axios.get(giAPI + nameInput);
            let artifact = response.data;
            giEmbed
                .setTitle(artifact.name)
                .addFields([{ name: "Max Rarity:", value: `${artifact.max_rarity}⭐`, inline: true }]);
            let pieceBonusVarName = "-piece_bonus";
            for (let i = 1; i <= 5; i++) {
                if (artifact[`${i}${pieceBonusVarName}`]) giEmbed.addFields([{ name: `${i}-Piece Bonus:`, value: artifact[`${i}${pieceBonusVarName}`] }]);
            };
            break;
    };
    return sendMessage({ interaction: interaction, embeds: giEmbed, ephemeral: ephemeral });
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
const detailedOption = new SlashCommandBooleanOption()
    .setName("detailed")
    .setDescription("Whether to show detailed info.");
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const characterSubcommand = new SlashCommandSubcommandBuilder()
    .setName("character")
    .setDescription("Get info on a character.")
    .addStringOption(characterOption)
    .addBooleanOption(detailedOption)
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