module.exports = async (client, interaction) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
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
        let monstersJSON;
        const { EligibleRoles } = require('../database/dbServices/server.api');

        const api_trophy = require('../database/dbServices/trophy.api');
        const api_user = require('../database/dbServices/user.api');

        if (!interaction) return;
        if (interaction.user.bot) return;
        switch (interaction.type) {
            case "APPLICATION_COMMAND":
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
                        await cmd.run(client, interaction);
                    } catch (e) {
                        // console.log(e);
                        return;
                    };
                    return;
                } else {
                    return;
                };
            case "MESSAGE_COMPONENT":
                switch (interaction.componentType) {
                    case "BUTTON":
                        let messageObject = null;
                        if (interaction.customId.startsWith("pkm")) {
                            // Pokémon command
                            let newPokemonName = null;
                            for (let componentRow of interaction.message.components) {
                                if (newPokemonName) break;
                                newPokemonName = componentRow.components.find(component => component.customId == interaction.customId);
                            };
                            if (!newPokemonName) return;
                            let learnsetBool = (interaction.customId.split("|")[1] == "true");
                            let shinyBool = (interaction.customId.split("|")[2] == "true");
                            newPokemonName = newPokemonName.label;
                            let pokemon = Dex.species.get(newPokemonName);
                            if (!pokemon || !pokemon.exists) return;
                            messageObject = await getPokemon({ client: client, interaction: interaction, pokemon: pokemon, learnsetBool: learnsetBool, shinyBool: shinyBool });
                            if (!messageObject) return;
                            await interaction.update({ embeds: [messageObject.embeds], components: messageObject.components });
                            return;
                        } else if (interaction.customId.startsWith("mhSub")) {
                            monstersJSON = require("../submodules/monster-hunter-DB/monsters.json");
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
                            await interaction.update({ embeds: [messageObject.embeds], components: messageObject.components });
                        } else if (interaction.customId.includes("minesweeper")) {
                            // Minesweeper
                            if (interaction.user.id !== interaction.customId.split("-")[3]) return;
                            let componentsCopy = interaction.message.components;
                            await componentsCopy.forEach(async function (part, index) {
                                await this[index].toJSON().components.forEach(function (part2, index2) {
                                    if (this[index2].custom_id == interaction.customId) {
                                        this[index2].emoji.name = interaction.customId.split("-")[2];
                                        this[index2].disabled = true; // Doesnt work??
                                    };
                                }, this[index].toJSON().components);
                            }, componentsCopy);
                            await interaction.update({ components: componentsCopy });
                            return;
                        } else if (interaction.customId.startsWith("bgd")) {
                            // trophy shop??
                            const offset = parseInt(interaction.customId.substring(3));
                            let trophy_slice = await require('../util/trophies/getTrophyEmbedSlice')(offset);
                            await interaction.update({ embeds: [trophy_slice.embed], components: [trophy_slice.components] });
                        } else if (interaction.customId.startsWith("usf")) {
                            // userinfo
                            const data = interaction.customId.match(/usf([0-9]+):([0-9]+)/);
                            const page = parseInt(data[1]);
                            const user = data[2];
                            let userinfo_page = await require('../util/userinfo/getUserInfoSlice')(client, interaction, page, { id: user });
                            await interaction.update({ embeds: [userinfo_page.embeds], components: [userinfo_page.components] });
                        } else {
                            // Other buttons
                            return;
                        };
                    case "SELECT_MENU":
                        if (interaction.customId == 'role-select') {
                            try {
                                // Toggle selected role
                                const rolesArray = [];
                                for await (const value of interaction.values) {
                                    const roleArrayItem = await interaction.guild.roles.fetch(value);
                                    rolesArray.push(roleArrayItem);
                                };
                                if (rolesArray.length < 1) return sendMessage({ client: client, interaction: interaction, content: `None of the selected roles are valid.` });
                                let adminBool = isAdmin(client, interaction.guild.me);

                                let roleSelectReturnString = "Role toggling results:\n";
                                for await (const role of rolesArray) {
                                    let checkRoleEligibility = await EligibleRoles.findOne({ where: { role_id: role.id } });
                                    if (!checkRoleEligibility) roleSelectReturnString += `❌ ${role} is not available to selfassign anymore.\n`;
                                    if (role.managed) roleSelectReturnString += `❌ I can't manage ${role} because it is being automatically managed by an integration.\n`;
                                    if (interaction.guild.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) roleSelectReturnString += `❌ I do not have permission to manage ${role}.\n`;
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
            case "APPLICATION_COMMAND_AUTOCOMPLETE":
                let focusedOption = interaction.options.getFocused(true);
                let choices = [];
                // Common arguments 
                switch (focusedOption.name) {
                    // Used in: coinflip, bet
                    case "bet-amount":
                        let balance = await api_user.getMoney(interaction.user.id);
                        if (balance > 0) {
                            balance = Math.floor(balance);
                            let balanceHalf = Math.floor(balance / 2);
                            let balanceQuarter = Math.floor(balance / 4);
                            let balanceRandom = randomNumber(1, balance);
                            choices.push({ name: `All your money: ${balance}${globalVars.currency}`, value: balance });
                            if (balance >= 2) choices.push({ name: `Half your money: ${balanceHalf}${globalVars.currency}`, value: balanceHalf });
                            if (balance >= 4) choices.push({ name: `A quarter: ${balanceQuarter}${globalVars.currency}`, value: balanceQuarter });
                            if (balance >= 5) choices.push({ name: `Random amount`, value: balanceRandom });
                        } else {
                            choices.push({ name: "Chat to earn money!", value: 0 });
                        };
                        break;
                    case "time":
                        choices.push({ name: "1 hour", value: 60 });
                        choices.push({ name: "2 hours", value: 120 });
                        choices.push({ name: "4 hours", value: 240 });
                        choices.push({ name: "8 hours", value: 480 });
                        choices.push({ name: "12 hours", value: 720 });
                        choices.push({ name: "1 day", value: 1440 });
                        choices.push({ name: "1 week", value: 10080 });
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
                        switch (focusedOption.name) {
                            case "pokemon":
                                let pokemonSpecies = Dex.species.all();
                                let usageBool = (interaction.options.getSubcommand() == "usage");
                                await pokemonSpecies.forEach(species => {
                                    let pokemonIdentifier = `${species.num}: ${species.name}`;
                                    if ((pokemonIdentifier.toLowerCase().includes(focusedOption.value))
                                        && species.exists
                                        && species.num > 0
                                        && !(usageBool && species.name.endsWith("-Gmax"))) choices.push({ name: pokemonIdentifier, value: species.name });
                                });
                                break;
                            case "ability":
                                let abilities = Dex.abilities.all();
                                await abilities.forEach(ability => {
                                    if (ability.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && ability.exists && ability.name !== "No Ability" && ability.isNonstandard !== "CAP") choices.push({ name: ability.name, value: ability.name });
                                });
                                break;
                            case "move":
                                let moves = Dex.moves.all();
                                await moves.forEach(move => {
                                    if (move.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && move.exists && move.isNonstandard !== "CAP") choices.push({ name: move.name, value: move.name });
                                });
                                break;
                            case "item":
                                let items = Dex.items.all();
                                await items.forEach(item => {
                                    if (item.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && item.exists) choices.push({ name: item.name, value: item.name });
                                });
                                break;
                            case "nature":
                                let natures = Dex.natures.all();
                                await natures.forEach(nature => {
                                    if (nature.name.toLowerCase().includes(focusedOption.value.toLowerCase()) && nature.exists) choices.push({ name: nature.name, value: nature.name });
                                });
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
                        monstersJSON = require("../submodules/monster-hunter-DB/monsters.json");
                        const questsJSON = require("../submodules/monster-hunter-DB/quests.json");
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
                        const splatoonLanguages = require("../objects/splatoon/languages.json");
                        let languageDefault = "EUen";
                        let languageJSON = null;
                        let languageInput = interaction.options.getString("language");
                        if (languageInput && Object.keys(splatoonLanguages).includes(languageInput)) languageJSON = require(`../submodules/leanny.github.io/splat3/data/language/${languageInput}.json`);
                        if (!languageJSON) languageJSON = require(`../submodules/leanny.github.io/splat3/data/language/${languageDefault}.json`);
                        switch (focusedOption.name) {
                            case "clothing":
                                let allClothesNames = {
                                    ...languageJSON["CommonMsg/Gear/GearName_Head"],
                                    ...languageJSON["CommonMsg/Gear/GearName_Clothes"],
                                    ...languageJSON["CommonMsg/Gear/GearName_Shoes"]
                                };
                                for await (const [key, value] of Object.entries(allClothesNames)) {
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase()) && !key.startsWith("COP00")) choices.push({ name: value, value: key });
                                };
                                break;
                            case "weapon":
                                for await (const [key, value] of Object.entries(languageJSON["CommonMsg/Weapon/WeaponName_Main"])) {
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase()) && !key.endsWith("_Coop") && !key.endsWith("_Msn") && !key.includes("_Rival") && !key.includes("_AMB_") && key !== "Free") choices.push({ name: value, value: key });
                                };
                                break;
                            case "subweapon":
                                for await (const [key, value] of Object.entries(languageJSON["CommonMsg/Weapon/WeaponName_Sub"])) {
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase()) && !key.includes("_Rival") && !key.includes("_Coop") && value !== "-" && !key.includes("SalmonBuddy")) choices.push({ name: value, value: key });
                                };
                                break;
                            case "special":
                                for await (const [key, value] of Object.entries(languageJSON["CommonMsg/Weapon/WeaponName_Special"])) {
                                    // Gachihoko = Rainmaker
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase()) && !key.endsWith("_Coop") && !key.endsWith("_Mission") && !key.includes("_Rival") && value !== "-" && !value.includes("Gachihoko")) choices.push({ name: value, value: key });
                                };
                                break;
                            case "language":
                                for await (const [key, value] of Object.entries(splatoonLanguages)) {
                                    if (value.toLowerCase().includes(focusedOption.value.toLowerCase())) choices.push({ name: value, value: key });
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
                                break;
                        };
                        break;
                    case "genshin":
                        let giAPI = `https://api.genshin.dev/`;
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
                                    if (key.toLowerCase().includes(focusedOption.value.toLowerCase()) && value.element !== "trait") choices.push({ name: key, value: key });
                                };
                                break;
                            case "trait":
                                for await (const [key, value] of Object.entries(skillMapRoyal)) {
                                    if (key.toLowerCase().includes(focusedOption.value.toLowerCase()) && value.element == "trait") choices.push({ name: key, value: key });
                                };
                                break;
                            case "item":
                                eval(fs.readFileSync("submodules/persona5_calculator/data/ItemDataRoyal.js", "utf8"));
                                for await (const [key, value] of Object.entries(itemMapRoyal)) {
                                    if (key.toLowerCase().includes(focusedOption.value.toLowerCase()) && !value.skillCard) choices.push({ name: key, value: key });
                                };
                        };
                        break;
                    case "coinflip":
                        switch (focusedOption.name) {
                            case "side":
                                choices.push({ name: "Heads", value: "Heads" });
                                choices.push({ name: "Tails", value: "Tails" });
                                break;
                        };
                        break;
                    // VERY low priority
                    case "rps":
                        switch (focusedOption.name) {
                            case "weapon":
                                choices.push({ name: "Rock", value: "Rock" });
                                choices.push({ name: "Paper", value: "Paper" });
                                choices.push({ name: "Scissors", value: "Scissors" });
                                break;
                        };
                    case "manager":
                        switch (focusedOption.name) {
                            case "name":
                                let trophies = await api_trophy.getShopTrophies();
                                let temp = ''
                                trophies.forEach(trophy => {
                                    temp = trophy.trophy_id;
                                    if (temp.toLowerCase().includes(focusedOption.value)) { choices.push({ name: temp, value: temp }); }
                                })
                        };
                        break;
                    case "trophy":
                        switch (focusedOption.name) {
                            case "shoptrophy":
                                const buyable_items = await api_trophy.getBuyableShopTrophies(interaction.user.id);

                                buyable_items.forEach(trophy => {
                                    choices.push({ name: trophy, value: trophy });
                                })
                                // if (choices.length == 0){
                                //     choices.push({ name: "You need more money in order to buy!", value: "1"});
                                // }

                                break;
                            case "trophy":
                                let trophies = await api_trophy.getShopTrophies();
                                let temp = ''
                                trophies.forEach(trophy => {
                                    temp = trophy.trophy_id;
                                    if (temp.toLowerCase().includes(focusedOption.value)) { choices.push({ name: temp, value: temp }); }
                                })
                                trophies = await api_trophy.getEventTrophies();
                                trophies.forEach(trophy => {
                                    temp = trophy.trophy_id;
                                    if (temp.toLowerCase().includes(focusedOption.value)) { choices.push({ name: temp, value: temp }); }
                                })
                                // if (choices.length == 0){
                                //     choices.push({ name: "You need more money in order to buy!", value: "1"});
                                // }

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
                    //console.log(e);
                });
                break;
            case "MODAL_SUBMIT":
                let userAvatar = interaction.user.displayAvatarURL(globalVars.displayAvatarSettings);
                switch (interaction.customId) {
                    case "bugReportModal":
                        // Bug report
                        const bugReportTitle = interaction.fields.getTextInputValue('bugReportTitle');
                        const bugReportDescribe = interaction.fields.getTextInputValue('bugReportDescribe');
                        const bugReportReproduce = interaction.fields.getTextInputValue('bugReportReproduce');
                        const bugReportBehaviour = interaction.fields.getTextInputValue('bugReportBehaviour');
                        const bugReportContext = interaction.fields.getTextInputValue('bugReportContext');
                        let DMChannel = await client.channels.fetch(client.config.devChannelID);

                        const bugReportEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor({ name: `Bug Report 🐛` })
                            .setThumbnail(userAvatar)
                            .setTitle(bugReportTitle)
                            .setDescription(bugReportDescribe)
                            .addField("Reproduce:", bugReportReproduce, false)
                            .addField("Expected Behaviour:", bugReportBehaviour, false)
                            .addField("Device Context:", bugReportContext, false)
                            .setFooter({ text: interaction.user.tag });

                        await DMChannel.send({ content: interaction.user.id, embeds: [bugReportEmbed] });
                        return sendMessage({ client: client, interaction: interaction, content: `Thanks for the bug report!\nIf your DMs are open you may get a DM from ${client.user.username} with a follow-up.` });
                        break;
                    case "modMailModal":
                        // Modmail
                        const modMailTitle = interaction.fields.getTextInputValue('modMailTitle');
                        const modMailDescribe = interaction.fields.getTextInputValue('modMailDescribe');

                        let profileButtons = new Discord.MessageActionRow()
                            .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${interaction.user.id}` }));

                        const modMailEmbed = new Discord.MessageEmbed()
                            .setColor(globalVars.embedColor)
                            .setAuthor({ name: `Mod Mail 💌` })
                            .setThumbnail(userAvatar)
                            .setTitle(modMailTitle)
                            .setDescription(modMailDescribe)
                            .setFooter({ text: `${interaction.user.tag} (${interaction.user.id})` });

                        await interaction.guild.publicUpdatesChannel.send({ embeds: [modMailEmbed], components: [profileButtons] });
                        return sendMessage({ client: client, interaction: interaction, content: `Your message has been sent to the mods!\nModerators should get back to you as soon as soon as possible.` });
                        break;
                };
                return;
            case "PING":
                return;
            default:
                return;
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};