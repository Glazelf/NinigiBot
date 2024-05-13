module.exports = async (client, interaction) => {
    const logger = require('../util/logger');
    try {
        const Discord = require("discord.js");
        let sendMessage = require('../util/sendMessage');
        let isAdmin = require('../util/isAdmin');
        const getPokemon = require('../util/pokemon/getPokemon');
        const getMonster = require('../util/mh/getMonster');
        const randomNumber = require('../util/randomNumber');
        const capitalizeString = require('../util/capitalizeString');
        const { Dex } = require('pokemon-showdown');
        const axios = require("axios");
        const fs = require("fs");
        const monstersJSON = require("../submodules/monster-hunter-DB/monsters.json");
        const questsJSON = require("../submodules/monster-hunter-DB/quests.json");

        const { EligibleRoles } = require('../database/dbServices/server.api');
        const api_trophy = require('../database/dbServices/trophy.api');
        const api_user = require('../database/dbServices/user.api');

        if (!interaction) return;
        if (interaction.user.bot) return;
        let inCommandInteractions = ["battleYes", "battleNo"]; // Interactions that are handled in the command file
        if (inCommandInteractions.includes(interaction.customId)) return;
        switch (interaction.type) {
            case Discord.InteractionType.ApplicationCommand:
                if (!interaction.member) return sendMessage({ client: client, interaction: interaction, content: `Sorry, you're not allowed to use commands in private messages!\nThis is because a lot of the responses require a server to be present.\nDon't worry, similar to this message, most of my replies will be invisible to other server members!` });
                // Grab the command data from the client.commands Enmap
                let cmd;
                let commandName = interaction.commandName.toLowerCase().replace(" ", "");
                // Slower? command checker, since some commands user capitalization
                await client.commands.forEach(command => {
                    if (command.config.name.toLowerCase().replace(" ", "") == commandName) cmd = client.commands.get(commandName);
                });
                if (!cmd) {
                    if (client.aliases.has(commandName)) cmd = client.commands.get(client.aliases.get(commandName));
                };
                // Run the command
                if (cmd) {
                    try {
                        let ephemeralDefault = await api_user.getEphemeralDefault(interaction.user.id);
                        if (ephemeralDefault === null) ephemeralDefault = true;
                        await cmd.run(client, interaction, logger, ephemeralDefault);
                    } catch (e) {
                        // console.log(e);
                        return;
                    };
                    return;
                } else {
                    return;
                };
            case Discord.InteractionType.MessageComponent:
                switch (interaction.componentType) {
                    case Discord.ComponentType.Button:
                        let messageObject = null;
                        if (!interaction.customId) return;
                        if (interaction.user.id !== interaction.message.interaction.user.id) return sendMessage({ client: client, interaction: interaction, content: `Only ${interaction.message.interaction.user} can use this button as the original interaction was used by them!`, ephemeral: true });
                        if (interaction.customId.startsWith("pkm")) {
                            // Pokémon command
                            let newPokemonName = null;
                            for (let componentRow of interaction.message.components) {
                                if (newPokemonName) break;
                                newPokemonName = componentRow.components.find(component => component.customId == interaction.customId);
                            };
                            if (!newPokemonName) return;
                            let customIdSplit = interaction.customId.split("|")
                            let learnsetBool = (customIdSplit[1] == "true");
                            let shinyBool = (customIdSplit[2] == "true");
                            let generationButton = customIdSplit[3];
                            newPokemonName = newPokemonName.label;
                            let pokemon = Dex.mod(`gen${generationButton}`).species.get(newPokemonName);
                            if (!pokemon || !pokemon.exists) return;
                            messageObject = await getPokemon({ client: client, interaction: interaction, pokemon: pokemon, learnsetBool: learnsetBool, generation: generationButton, shinyBool: shinyBool });
                            if (!messageObject) return;
                            return interaction.update({ embeds: [messageObject.embeds], components: messageObject.components });
                        } else if (interaction.customId.startsWith("mhSub")) {
                            // Monster Hunter forms
                            let newMonsterName = null;
                            for (let componentRow of interaction.message.components) {
                                if (newMonsterName) break;
                                newMonsterName = componentRow.components.find(component => component.customId == interaction.customId);
                            };
                            if (!newMonsterName) return;
                            newMonsterName = newMonsterName.label;
                            let monsterData = null;
                            monstersJSON.monsters.forEach(monster => {
                                if (monster.name == newMonsterName) monsterData = monster;
                            });
                            if (!monsterData) return;
                            messageObject = await getMonster(client, interaction, monsterData);
                            if (!messageObject) return;
                            return interaction.update({ embeds: [messageObject.embeds], components: messageObject.components });
                        } else if (interaction.customId.startsWith("mhquests")) {
                            // Monster Hunter quests
                            const getQuests = require('../util/mh/getQuests');
                            let mhQuestsDirection = interaction.customId.split("|")[1];
                            let mhQuestsGameName = interaction.customId.split("|")[2];
                            let mhQuestsPage = interaction.customId.split("|")[3];
                            let mhQuestsPagesTotal = interaction.customId.split("|")[4];
                            switch (mhQuestsDirection) {
                                case "left":
                                    mhQuestsPage = parseInt(mhQuestsPage) - 1;
                                    break;
                                case "right":
                                    mhQuestsPage = parseInt(mhQuestsPage) + 1;
                                    break;
                                case "first":
                                    mhQuestsPage = 1;
                                    break;
                                case "last":
                                    mhQuestsPage = mhQuestsPagesTotal;
                                    break;
                            };
                            if (mhQuestsPage < 1) mhQuestsPage = 1;
                            if (mhQuestsPage > mhQuestsPagesTotal) mhQuestsPage = mhQuestsPagesTotal;
                            let mhQuestsMessageObject = await getQuests({ client: client, interaction: interaction, gameName: mhQuestsGameName, page: mhQuestsPage });
                            return interaction.update({ embeds: [mhQuestsMessageObject.embeds], components: mhQuestsMessageObject.components });
                        } else if (interaction.customId.startsWith("splatfest")) {
                            // Splatfest
                            const getSplatfests = require('../util/splat/getSplatfests');
                            let splatfestDirection = interaction.customId.split("|")[1];
                            let splatfestPage = interaction.customId.split("|")[2];
                            let splatfestRegion = interaction.customId.split("|")[3];
                            switch (splatfestDirection) {
                                case "left":
                                    splatfestPage = parseInt(splatfestPage) + 1;
                                    break;
                                case "right":
                                    splatfestPage = parseInt(splatfestPage) - 1;
                                    break;
                            };
                            let splatfestMessageObject = await getSplatfests({ client: client, interaction: interaction, page: splatfestPage, region: splatfestRegion });
                            return interaction.update({ embeds: [splatfestMessageObject.embeds], components: splatfestMessageObject.components });
                        } else if (interaction.customId.includes("minesweeper")) {
                            // Minesweeper
                            let componentsCopy = interaction.message.components;
                            await componentsCopy.forEach(async function (part, index) {
                                await this[index].toJSON().components.forEach(function (part2, index2) {
                                    if (this[index2].custom_id == interaction.customId) {
                                        this[index2].emoji.name = interaction.customId.split("-")[2];
                                        this[index2].disabled = true; // Doesnt work??
                                    };
                                }, this[index].toJSON().components);
                            }, componentsCopy);
                            return interaction.update({ components: componentsCopy });
                        } else if (interaction.customId.startsWith("bgd")) {
                            // Trophy shop
                            const offset = parseInt(interaction.customId.substring(3));
                            let trophy_slice = await require('../util/trophies/getTrophyEmbedSlice')(client, offset);
                            return interaction.update({ embeds: [trophy_slice.embed], components: [trophy_slice.components] });
                        } else if (interaction.customId.startsWith("usf")) {
                            // Userinfo
                            const data = interaction.customId.match(/usf([0-9]+):([0-9]+)/);
                            const page = parseInt(data[1]);
                            const user = data[2];
                            let userinfo_page = await require('../util/userinfo/getUserInfoSlice')(client, interaction, page, { id: user });
                            return interaction.update({ embeds: [userinfo_page.embeds], components: [userinfo_page.components] });
                        } else {
                            // Other buttons
                            return;
                        };
                    case Discord.ComponentType.SelectMenu:
                        if (interaction.customId == 'role-select') {
                            try {
                                // Toggle selected role
                                const rolesArray = [];
                                for await (const value of interaction.values) {
                                    const roleArrayItem = await interaction.guild.roles.fetch(value);
                                    rolesArray.push(roleArrayItem);
                                };
                                if (rolesArray.length < 1) return sendMessage({ client: client, interaction: interaction, content: `None of the selected roles are valid.` });
                                let adminBool = isAdmin(client, interaction.guild.members.me);

                                let roleSelectReturnString = "Role toggling results:\n";
                                for await (const role of rolesArray) {
                                    let checkRoleEligibility = await EligibleRoles.findOne({ where: { role_id: role.id } });
                                    if (!checkRoleEligibility) roleSelectReturnString += `❌ ${role} is not available to selfassign anymore.\n`;
                                    if (role.managed) roleSelectReturnString += `❌ I can't manage ${role} because it is being automatically managed by an integration.\n`;
                                    if (interaction.guild.members.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) roleSelectReturnString += `❌ I do not have permission to manage ${role}.\n`;
                                    try {
                                        if (interaction.member.roles.cache.has(role.id)) {
                                            await interaction.member.roles.remove(role);
                                            roleSelectReturnString += `✅ You no longer have ${role}!\n`
                                        } else {
                                            await interaction.member.roles.add(role);
                                            roleSelectReturnString += `✅ You now have ${role}!\n`;
                                        };
                                    } catch (e) {
                                        roleSelectReturnString += `❌ Failed to toggle ${role}, probably because I lack permissions.\n`;
                                    };
                                };
                                return sendMessage({ client: client, interaction: interaction, content: roleSelectReturnString });
                            } catch (e) {
                                console.log(e);
                                return;
                            };
                        } else {
                            // Other select menus
                            return;
                        };
                    default:
                        // Other component types
                        return;
                };
            case Discord.InteractionType.ApplicationCommandAutocomplete:
                let focusedOption = interaction.options.getFocused(true);
                let choices = [];
                // Common arguments 
                switch (focusedOption.name) {
                    case "time":
                        choices.push({ name: "1 hour", value: 60 });
                        choices.push({ name: "2 hours", value: 120 });
                        choices.push({ name: "4 hours", value: 240 });
                        choices.push({ name: "8 hours", value: 480 });
                        choices.push({ name: "12 hours", value: 720 });
                        choices.push({ name: "1 day", value: 1440 });
                        choices.push({ name: "1 week", value: 10080 });
                        choices.push({ name: "2 weeks", value: 20160 });
                        choices.push({ name: "1 month", value: 43800 });
                        break;
                };
                // Unique argument tree
                switch (interaction.commandName) {
                    case "role":
                        switch (focusedOption.name) {
                            case "role":
                                let dbRoles = await EligibleRoles.findAll();
                                let roleIDs = [];
                                let roleObject = [];
                                await dbRoles.forEach(eligibleRole => {
                                    roleIDs.push(eligibleRole.role_id);
                                });
                                await interaction.guild.roles.cache.forEach(async (role) => {
                                    if (roleIDs.includes(role.id)) {
                                        let choiceName = role.name;
                                        let dbRole = dbRoles.find(eligibleRole => eligibleRole.role_id == role.id);
                                        if (dbRole.description) choiceName = `${choiceName} | ${dbRole.description}`;
                                        roleObject.push({ name: choiceName, value: role.id, position: role.position });
                                    };
                                });
                                roleObject = roleObject.sort((r, r2) => r2.position - r.position);
                                await roleObject.forEach(role => {
                                    if (role.name.toLowerCase().includes(focusedOption.value)) choices.push({ name: role.name, value: role.value });
                                });
                                break;
                        };
                        break;
                    case "pokemon":
                        let currentGeneration = 9
                        let generationInput = interaction.options.getInteger("generation") || currentGeneration;
                        let dexModified = Dex.mod(`gen${generationInput}`);
                        switch (focusedOption.name) {
                            case "pokemon":
                                // For some reason filtering breaks the original sorted order, sort by number to restore it
                                let pokemonSpecies = dexModified.species.all().filter(species => species.num > 0 && species.exists && !["CAP", "Future"].includes(species.isNonstandard)).sort((a, b) => a.num - b.num);
                                let usageBool = (interaction.options.getSubcommand() == "usage");
                                await pokemonSpecies.forEach(species => {
                                    let pokemonIdentifier = `${species.num}: ${species.name}`;
                                    if ((pokemonIdentifier.toLowerCase().includes(focusedOption.value))
                                        && !(usageBool && species.name.endsWith("-Gmax"))) choices.push({ name: pokemonIdentifier, value: species.name });
                                });
                                break;
                            case "ability":
                                // For some reason filtering breaks the original sorted order, sort by name to restore it
                                let abilities = dexModified.abilities.all().filter(ability => ability.exists && ability.name !== "No Ability" && !["CAP", "Future"].includes(ability.isNonstandard)).sort((a, b) => a.name.localeCompare(b.name));
                                await abilities.forEach(ability => {
                                    if (ability.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: ability.name, value: ability.name });
                                });
                                break;
                            case "move":
                                // For some reason filtering breaks the original sorted order, sort by name to restore it
                                let moves = dexModified.moves.all().filter(move => move.exists && !["CAP", "Future"].includes(move.isNonstandard)).sort((a, b) => a.name.localeCompare(b.name));
                                await moves.forEach(move => {
                                    if (move.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: move.name, value: move.name });
                                });
                                break;
                            case "item":
                                // For some reason filtering breaks the original sorted order, sort by name to restore it
                                let items = dexModified.items.all().filter(item => item.exists && !["CAP", "Future"].includes(item.isNonstandard)).sort((a, b) => a.name.localeCompare(b.name));
                                await items.forEach(item => {
                                    if (item.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: item.name, value: item.name });
                                });
                                break;
                            case "nature":
                                let natures = Dex.natures.all();
                                await natures.forEach(nature => {
                                    if (nature.name.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                                        nature.exists) choices.push({ name: nature.name, value: nature.name });
                                });
                                break;
                            case "format":
                                let formats = Dex.formats.all();
                                await formats.forEach(format => {
                                    if ((format.id.includes(focusedOption.value.toLowerCase()) || format.name.toLowerCase().includes(focusedOption.value.toLowerCase())) && !format.id.includes("random")) choices.push({ name: format.id, value: format.id });
                                });
                                break;
                            case "rating":
                                let ratings = [0, 1500, 1630, 1760];
                                let formatInput = interaction.options.getString("format");
                                if (formatInput && formatInput.match(/gen.{1,2}(ou)$/g)) ratings = [0, 1500, 1695, 1825];
                                await ratings.forEach(rating => {
                                    choices.push({ name: rating.toString(), value: rating });
                                });
                                break;
                        };
                        break;
                    case "monsterhunter":
                        switch (focusedOption.name) {
                            case "monster":
                                await monstersJSON.monsters.forEach(monster => {
                                    if (monster.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: monster.name, value: monster.name });
                                });
                                break;
                            case "quest":
                                await questsJSON.quests.forEach(quest => {
                                    if (quest.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: quest.name, value: quest.name });
                                });
                                break;
                        };
                        break;
                    case "splatoon3":
                        let languageDefault = "EUen";
                        let languageJSON = null;
                        let languageInput = interaction.options.getString("language");
                        if (languageInput) languageJSON = require(`../submodules/splat3/data/language/${languageInput}_full.json`);
                        if (!languageJSON) languageJSON = require(`../submodules/splat3/data/language/${languageDefault}_full.json`);
                        switch (focusedOption.name) {
                            case "clothing":
                                // structuredClone() makes sure the original object stays intact
                                let allClothesHead = structuredClone(languageJSON["CommonMsg/Gear/GearName_Head"]);
                                let allClothesBody = structuredClone(languageJSON["CommonMsg/Gear/GearName_Clothes"]);
                                let allClothesShoes = structuredClone(languageJSON["CommonMsg/Gear/GearName_Shoes"]);
                                for await (const [key, value] of Object.entries(allClothesHead)) {
                                    let clothesHeadEndString = "_Head";
                                    if (!key.endsWith(clothesHeadEndString)) {
                                        allClothesHead[`${key}${clothesHeadEndString}`] = allClothesHead[key];
                                        delete allClothesHead[key];
                                    };
                                };
                                for await (const [key, value] of Object.entries(allClothesBody)) {
                                    let clothesBodyEndString = "_Clothes";
                                    if (!key.endsWith(clothesBodyEndString)) {
                                        allClothesBody[`${key}${clothesBodyEndString}`] = allClothesBody[key];
                                        delete allClothesBody[key];
                                    };
                                };
                                for await (const [key, value] of Object.entries(allClothesShoes)) {
                                    let clothesShoesEndString = "_Shoes";
                                    if (!key.endsWith(clothesShoesEndString)) {
                                        allClothesShoes[`${key}${clothesShoesEndString}`] = allClothesShoes[key];
                                        delete allClothesShoes[key];
                                    };
                                };
                                let allClothesNames = { ...allClothesHead, ...allClothesBody, ...allClothesShoes };
                                for await (const [key, value] of Object.entries(allClothesNames)) {
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                                        !key.startsWith("COP00") &&
                                        !key.startsWith("Msn00")) choices.push({ name: value, value: key });
                                };
                                break;
                            case "weapon":
                                for await (const [key, value] of Object.entries(languageJSON["CommonMsg/Weapon/WeaponName_Main"])) {
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                                        !key.endsWith("_Coop") &&
                                        !key.endsWith("_Msn") &&
                                        !key.endsWith("_Rival") &&
                                        !key.endsWith("_Sdodr") &&
                                        !key.includes("_AMB_") &&
                                        key !== "Free" &&
                                        value !== "-") choices.push({ name: value, value: key });
                                };
                                break;
                            case "subweapon":
                                for await (const [key, value] of Object.entries(languageJSON["CommonMsg/Weapon/WeaponName_Sub"])) {
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                                        !key.endsWith("_Rival") &&
                                        !key.endsWith("_Coop") &&
                                        !key.endsWith("_Sdodr") &&
                                        value !== "-" &&
                                        !key.includes("SalmonBuddy")) choices.push({ name: value, value: key });
                                };
                                break;
                            case "special":
                                for await (const [key, value] of Object.entries(languageJSON["CommonMsg/Weapon/WeaponName_Special"])) {
                                    // Gachihoko = Rainmaker, Splashdown is only available in singleplayer missions but is for some reason still properly included here. To avoid importing more JSONs and reading whole objects, it's excluded this way.
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                                        !key.endsWith("_Coop") &&
                                        !key.endsWith("_Mission") &&
                                        !key.endsWith("Sdodr") &&
                                        !key.includes("_Rival") &&
                                        value !== "-" &&
                                        !key.includes("Gachihoko") &&
                                        !key.includes("SpSuperLanding")) choices.push({ name: value, value: key });
                                };
                                break;
                            case "mode":
                                let schedulesAPI = `https://splatoon3.ink/data/schedules.json`; // Includes all schedules.
                                let responseSchedules = await axios.get(schedulesAPI);
                                if (responseSchedules.data.data.currentFest) {
                                    choices.push({ name: "Splatfest Battle", value: "Splatfest Battle|festSchedules" });
                                } else {
                                    choices.push({ name: "Turf War", value: "Turf War|regularSchedules" });
                                    choices.push({ name: "Anarchy Battle (Series)", value: "Anarchy Battle (Series)|bankaraSchedules|series" });
                                    choices.push({ name: "Anarchy Battle (Open)", value: "Anarchy Battle (Open)|bankaraSchedules|open" });
                                    choices.push({ name: "X Battle", value: "X Battle|xSchedules" }); // Check if available during Splatfest
                                };
                                // choices.push({ name: "League Battle", value: "League Battle|leagueSchedules" }); // Uncomment when League Battle is available, also check if available during Splatfest or Big Run
                                let currentBigRun = responseSchedules.data.data.coopGroupingSchedule.bigRunSchedules.nodes[0];
                                let salmonRunTitle = "Salmon Run";
                                if (currentBigRun && Date.now() >= Date.parse(currentBigRun.startTime)) salmonRunTitle += " (Big Run)";
                                choices.push({ name: salmonRunTitle, value: "Salmon Run|coopGroupingSchedule" });
                                if (responseSchedules.data.data.eventSchedules.nodes.length > 0) choices.push({ name: "Challenges", value: "Challenges|eventSchedules" })
                                break;
                        };
                        break;
                    case "genshin":
                        let giAPI = `https://genshin.jmp.blue/`;
                        let giResponse;
                        switch (focusedOption.name) {
                            case "character":
                                giAPI += `characters/`;
                                giResponse = await axios.get(giAPI);
                                for (const giCharacter of giResponse.data) {
                                    let giCharacterCapitalized = capitalizeString(giCharacter);
                                    if (giCharacterCapitalized.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: giCharacterCapitalized, value: giCharacter });
                                };
                                break;
                            case "weapon":
                                giAPI += `weapons/`;
                                giResponse = await axios.get(giAPI);
                                for (const giWeapon of giResponse.data) {
                                    let giWeaponCapitalized = capitalizeString(giWeapon);
                                    if (giWeaponCapitalized.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: giWeaponCapitalized, value: giWeapon });
                                };
                                break;
                            case "artifact":
                                giAPI += `artifacts/`;
                                giResponse = await axios.get(giAPI);
                                for (const giArtifact of giResponse.data) {
                                    let giArtifactCapitalized = capitalizeString(giArtifact);
                                    if (giArtifactCapitalized.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: giArtifactCapitalized, value: giArtifact });
                                };
                                break;
                        };
                        break;
                    case "persona5":
                        // Submodule is documented in persona5 command
                        eval(fs.readFileSync("submodules/persona5_calculator/data/SkillDataRoyal.js", "utf8"));
                        switch (focusedOption.name) {
                            case "persona":
                                eval(fs.readFileSync("submodules/persona5_calculator/data/PersonaDataRoyal.js", "utf8"));
                                for await (const [key, value] of Object.entries(personaMapRoyal)) {
                                    if (key.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: key, value: key });
                                };
                                break;
                            case "skill":
                                for await (const [key, value] of Object.entries(skillMapRoyal)) {
                                    if (key.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                                        value.element !== "trait") choices.push({ name: key, value: key });
                                };
                                break;
                            case "trait":
                                for await (const [key, value] of Object.entries(skillMapRoyal)) {
                                    if (key.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                                        value.element == "trait") choices.push({ name: key, value: key });
                                };
                                break;
                            case "item":
                                eval(fs.readFileSync("submodules/persona5_calculator/data/ItemDataRoyal.js", "utf8"));
                                for await (const [key, value] of Object.entries(itemMapRoyal)) {
                                    if (key.toLowerCase().includes(focusedOption.value.toLowerCase()) &&
                                        !value.skillCard) choices.push({ name: key, value: key });
                                };
                        };
                        break;
                    case "dqm3":
                        let targetJSON = null
                        if (focusedOption.name.startsWith("trait")) {
                            targetJSON = require("../submodules/DQM3-db/objects/traits.json");
                        } else {
                            switch (focusedOption.name) {
                                case "parent1":
                                case "parent2":
                                case "target":
                                case "monster":
                                    targetJSON = require("../submodules/DQM3-db/objects/monsters.json");
                                    break;
                                case "area":
                                    // Currently unused, add spawns under detailed monster info once the db has them
                                    // targetJSON = require("../submodules/DQM3-db/objects/areas.json");
                                    break;
                                case "family":
                                    targetJSON = require("../submodules/DQM3-db/objects/families.json");
                                    break;
                                case "item":
                                    targetJSON = require("../submodules/DQM3-db/objects/items.json");
                                    break;
                                case "skill":
                                    targetJSON = require("../submodules/DQM3-db/objects/skills.json");
                                    break;
                                case "talent":
                                    targetJSON = require("../submodules/DQM3-db/objects/talents.json");
                                    break;
                            };
                        };
                        if (targetJSON) {
                            for await (const [key, value] of Object.entries(targetJSON)) {
                                if (value.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: value.name, value: key });
                            };
                        };
                        break;
                    case "helldivers2":
                        let apiHelldivers = "https://helldiverstrainingmanual.com/api/v1/";
                        switch (focusedOption.name) {
                            case "planet":
                                let planetsResponse = await axios.get(`${apiHelldivers}planets`);
                                let planetsData = planetsResponse.data;
                                for await (const [key, value] of Object.entries(planetsData)) {
                                    if (value.name.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: value.name, value: value.name });
                                };
                                break;
                        };
                        break;
                    case "manager":
                        switch (focusedOption.name) {
                            case "name":
                                let trophies = await api_trophy.getShopTrophies();
                                let temp = ''
                                trophies.forEach(trophy => {
                                    temp = trophy.trophy_id;
                                    if (temp.toLowerCase().includes(focusedOption.value)) { choices.push({ name: temp, value: temp }); }
                                });
                        };
                        break;
                    case "trophy":
                        switch (focusedOption.name) {
                            case "shoptrophy":
                                const buyable_items = await api_trophy.getBuyableShopTrophies(interaction.user.id);
                                buyable_items.forEach(trophy => {
                                    choices.push({ name: trophy, value: trophy });
                                });
                                // if (choices.length == 0) choices.push({ name: "You need more money in order to buy!", value: "1"});
                                break;
                            case "trophy":
                                let trophies = await api_trophy.getShopTrophies();
                                let temp = ''
                                trophies.forEach(trophy => {
                                    temp = trophy.trophy_id;
                                    if (temp.toLowerCase().includes(focusedOption.value)) choices.push({ name: temp, value: temp });
                                });
                                trophies = await api_trophy.getEventTrophies();
                                trophies.forEach(trophy => {
                                    temp = trophy.trophy_id;
                                    if (temp.toLowerCase().includes(focusedOption.value)) choices.push({ name: temp, value: temp });
                                });
                                // if (choices.length == 0) choices.push({ name: "You need more money in order to buy!", value: "1"});
                                break;
                        };
                        break;
                };
                choices = [... new Set(choices)]; // Remove duplicates, might not work lol
                if (choices.length > 25) choices = choices.slice(0, 25); // Max 25 entries
                // Add random suggestion
                if (focusedOption.name == "pokemon" || focusedOption.name == "monster") {
                    // Only display random suggestion if there enough other choices or value matches "random"
                    if (choices.length == 25) choices.pop();
                    if (choices.length > 5 || "random".includes(focusedOption.value.toLowerCase())) choices.push({ name: "Random", value: "random" });
                };
                // Empty choices return empty array
                if (choices.length < 1) return interaction.respond([]);
                // Return choices
                return interaction.respond(choices).catch(e => {
                    // console.log(e);
                });
                break;
            case Discord.InteractionType.ModalSubmit:
                let userAvatar = interaction.user.displayAvatarURL(client.globalVars.displayAvatarSettings);
                switch (interaction.customId) {
                    case "bugReportModal":
                        // Bug report
                        const bugReportTitle = interaction.fields.getTextInputValue('bugReportTitle');
                        const bugReportDescription = interaction.fields.getTextInputValue('bugReportDescription');
                        const bugReportReproduce = interaction.fields.getTextInputValue('bugReportReproduce');
                        const bugReportBehaviour = interaction.fields.getTextInputValue('bugReportBehaviour');
                        const bugReportContext = interaction.fields.getTextInputValue('bugReportContext');
                        let DMChannel = await client.channels.fetch(client.config.devChannelID);

                        const bugReportEmbed = new Discord.EmbedBuilder()
                            .setColor(client.globalVars.embedColor)
                            .setTitle(`Bug Report 🐛`)
                            .setThumbnail(userAvatar)
                            .setTitle(bugReportTitle)
                            .setDescription(bugReportDescription)
                            .addFields([
                                { name: "Reproduce:", value: bugReportReproduce, inline: false },
                                { name: "Expected Behaviour:", value: bugReportBehaviour, inline: false },
                                { name: "Device Context:", value: bugReportContext, inline: false }
                            ])
                            .setFooter({ text: interaction.user.username });
                        await DMChannel.send({ content: interaction.user.id, embeds: [bugReportEmbed] });
                        return sendMessage({ client: client, interaction: interaction, content: `Thanks for the bug report!\nIf your DMs are open you may get a DM from ${client.user.username} with a follow-up.` });
                        break;
                    case "modMailModal":
                        // Modmail
                        const modMailTitle = interaction.fields.getTextInputValue('modMailTitle');
                        const modMailDescription = interaction.fields.getTextInputValue('modMailDescription');

                        let profileButtons = new Discord.ActionRowBuilder()
                            .addComponents(new Discord.ButtonBuilder({ label: 'Profile', style: Discord.ButtonStyle.Link, url: `discord://-/users/${interaction.user.id}` }));
                        const modMailEmbed = new Discord.EmbedBuilder()
                            .setColor(client.globalVars.embedColor)
                            .setTitle(`Mod Mail 💌`)
                            .setThumbnail(userAvatar)
                            .setTitle(modMailTitle)
                            .setDescription(modMailDescription)
                            .setFooter({ text: `${interaction.user.username} (${interaction.user.id})` });

                        await interaction.guild.publicUpdatesChannel.send({ embeds: [modMailEmbed], components: [profileButtons] });
                        return sendMessage({ client: client, interaction: interaction, content: `Your message has been sent to the mods!\nModerators should get back to you as soon as soon as possible.` });
                        break;
                };
                return;
            default:
                return;
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};