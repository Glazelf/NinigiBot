// Global
import {
    InteractionType,
    MessageFlags,
    MessageFlagsBitField,
    ComponentType,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    inlineCode
} from "discord.js";
import axios from "axios";
axios.defaults.timeout = 5000; // Set here since it's the most neutral place where Axios is imported and I don't want to import it in bot.js just to set this value
import fs from "fs";
import logger from "../util/logger.js";
import sendMessage from "../util/discord/sendMessage.js";
import randomNumber from "../util/math/randomNumber.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };
// Pokémon
import { Dex } from '@pkmn/dex';
import { Dex as DexSim } from '@pkmn/sim';
import { Generations } from '@pkmn/data';
import getPokemon from "../util/pokemon/getPokemon.js";
import getWhosThatPokemon from "../util/pokemon/getWhosThatPokemon.js";
import pokemonCardSetsJSON from "../submodules/pokemon-tcg-data/sets/en.json" with { type: "json" };
// Monster Hunter
import getMHMonster from "../util/mh/getMonster.js";
import getMHQuests from "../util/mh/getQuests.js";
import MHMonstersJSON from "../submodules/monster-hunter-DB/monsters.json" with { type: "json" };
import MHQuestsJSON from "../submodules/monster-hunter-DB/quests.json" with { type: "json" };
// Splatoon
import getSplatfests from "../util/splat/getSplatfests.js";
// BTD
import getBossEvent from "../util/bloons/getBossEvent.js";
// Minesweeper
import createBoard from "../util/minesweeper/createBoard.js";
import getMatrixString from "../util/minesweeper/getMatrixString.js";
import revealSafeTile from "../util/minesweeper/revealSafeTile.js";
// Database
import {
    getEphemeralDefault,
    getMoney
} from "../database/dbServices/user.api.js";
import rewardMoney from "../util/db/rewardMoney.js";
import {
    getShopTrophies,
    getEventTrophies,
    getBuyableShopTrophies
} from "../database/dbServices/trophy.api.js";
// Other util
import isAdmin from "../util/discord/perms/isAdmin.js";
import capitalizeString from "../util/capitalizeString.js";
import getUserInfoSlice from "../util/userinfo/getUserInfoSlice.js";
import getTrophyEmbedSlice from "../util/trophies/getTrophyEmbedSlice.js";
import normalizeString from "../util/string/normalizeString.js";
import formatName from "../util/discord/formatName.js";

// Pokémon
const pokemonGenerations = new Generations(Dex);
// List all Pokemon Cards
let pokemonCardsBySet = {};
let pokemonCardsAll = [];
fs.readdir("./submodules/pokemon-tcg-data/cards/en", (err, files) => {
    if (err) return console.error(err);
    files.forEach(async (file) => {
        const fileName = file.split(".")[0];
        if (!pokemonCardsBySet[fileName]) pokemonCardsBySet[fileName] = [];
        const setJSON = await import(`../submodules/pokemon-tcg-data/cards/en/${file}`, { with: { type: "json" } });
        setJSON.default.forEach(card => {
            pokemonCardsBySet[fileName].push(card);
            pokemonCardsAll.push(card);
        });
    });
});
// Helldivers
const apiHelldivers = "https://helldiverstrainingmanual.com/api/v1/";
// Persona
// Submodule is documented in persona command
let skillMapRoyal, personaMapRoyal, itemMapRoyal;
eval(fs.readFileSync("submodules/persona5_calculator/data/SkillDataRoyal.js", "utf8").replace("var", ""));
eval(fs.readFileSync("submodules/persona5_calculator/data/PersonaDataRoyal.js", "utf8").replace("var", ""));
eval(fs.readFileSync("submodules/persona5_calculator/data/ItemDataRoyal.js", "utf8").replace("var", ""));
// Genshin Impact
const giAPI = `https://genshin.jmp.blue/`;

export default async (client, interaction) => {
    try {
        let messageFlags = new MessageFlagsBitField;
        // ID split
        let customIdSplit = null;
        if (interaction.customId) customIdSplit = interaction.customId.split("|");
        // Shinx battle state
        let inCommandInteractions = ["battleYes", "battleNo"]; // Interactions that are handled in the command file
        if (inCommandInteractions.includes(interaction.customId)) return;
        // Common variables
        let pkmQuizModalId = 'pkmQuizModal';
        let valuesByDate = {}; // Values that need to be timesorted
        if (![InteractionType.ApplicationCommand, InteractionType.ApplicationCommandAutocomplete].includes(interaction.type)) console.log(`${interaction.user.username}: ${interaction.customId}`);  // #1033, add "if (process.env.DEBUG == 1)" when fixed
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                // Grab the command data from the client.commands collection
                let cmd;
                let commandName = interaction.commandName.toLowerCase().replace(" ", "");
                // Slower? command checker, since some commands user capitalization
                await client.commands.forEach(command => {
                    if (command.commandObject.name.toLowerCase().replace(" ", "") == commandName) cmd = client.commands.get(commandName);
                });
                // Run the command
                if (cmd) {
                    let ephemeralDefault = await getEphemeralDefault(interaction.user.id);
                    switch (interaction.options.getBoolean("ephemeral")) {
                        case true:
                            messageFlags.add(MessageFlags.Ephemeral);
                            break;
                        case false:
                            messageFlags.remove(MessageFlags.Ephemeral);
                            break;
                        default:
                            if (ephemeralDefault !== false) messageFlags.add(MessageFlags.Ephemeral);
                            break;
                    };
                    console.log(`${interaction.user.username}: ${commandName}`); // #1033, add "if (process.env.DEBUG == 1)" when fixed
                    await cmd.default(interaction, messageFlags);
                    return;
                } else {
                    return;
                };
            case InteractionType.MessageComponent:
                switch (interaction.componentType) {
                    case ComponentType.Button:
                        if (!interaction.customId || interaction.replied) return;
                        let messageObject = null;
                        let contentReturn = null;
                        let embedsReturn = null;
                        let componentsReturn = null;
                        let filesReturn = null;
                        let pkmQuizGuessButtonIdStart = "pkmQuizGuess";
                        // Check for behaviour of interacting with buttons depending on user
                        let isOriginalUser = (interaction.user.id == interaction.message.interaction?.user.id);
                        let notOriginalUserMessageFlags = new MessageFlagsBitField(messageFlags);
                        let notOriginalUserMessageObject = { interaction: interaction, content: `Only ${interaction.message.interaction?.user} can use this button as the original interaction was used by them.`, flags: notOriginalUserMessageFlags.add(MessageFlags.Ephemeral) };
                        let editOriginalMessage = (isOriginalUser ||
                            interaction.customId.startsWith(pkmQuizGuessButtonIdStart) ||
                            !interaction.message.interaction);

                        let pkmQuizModalGuessId = `pkmQuizModalGuess|${customIdSplit[1]}`;
                        // Response in case of forfeit/reveal
                        if (interaction.customId.startsWith("pkmQuizReveal")) {
                            if (!isOriginalUser) return sendMessage(notOriginalUserMessageObject);
                            let pkmQuizRevealCorrectAnswer = interaction.message.components[0].components[0].customId.split("|")[1];
                            let pkmQuizRevealMessageObject = await getWhosThatPokemon({ interaction: interaction, winner: interaction.user, pokemon: pkmQuizRevealCorrectAnswer, reveal: true });
                            contentReturn = pkmQuizRevealMessageObject.content;
                            embedsReturn = pkmQuizRevealMessageObject.embeds;
                            filesReturn = pkmQuizRevealMessageObject.files;
                            componentsReturn = pkmQuizRevealMessageObject.components;
                        } else if (interaction.customId.startsWith(pkmQuizGuessButtonIdStart)) {
                            // Who's That Pokémon? modal
                            const pkmQuizModal = new ModalBuilder()
                                .setCustomId(pkmQuizModalId)
                                .setTitle("Who's That Pokémon?");
                            const pkmQuizModalGuessInput = new TextInputBuilder()
                                .setCustomId(pkmQuizModalGuessId)
                                .setLabel("Put in your guess!")
                                .setPlaceholder("Azelf-Mega-Y")
                                .setStyle(TextInputStyle.Short)
                                .setMinLength(2) // Mew, Muk etc. are the shortest names at 3 characters. Set to 2 to allow for 2 character aliases like p2, pz.
                                .setMaxLength(25) // Urshifu-Rapid-Strike-Gmax and Dudunsparce-Three-Segment are the longest names at 25 characters
                                .setRequired(true);
                            const pkmQuizActionRow = new ActionRowBuilder()
                                .addComponents(pkmQuizModalGuessInput);
                            pkmQuizModal.addComponents(pkmQuizActionRow);
                            return interaction.showModal(pkmQuizModal);
                        } else if (interaction.customId.startsWith("pkm")) {
                            // Pokémon command
                            let newPokemonName = null;
                            for (let componentRow of interaction.message.components) {
                                if (newPokemonName) break;
                                newPokemonName = componentRow.components.find(component => component.customId == interaction.customId);
                            };
                            if (!newPokemonName) return;

                            let learnsetBool = (customIdSplit[1] == "true");
                            let shinyBool = (customIdSplit[2] == "true");
                            let generationButton = customIdSplit[3];
                            let genData = pokemonGenerations.get(generationButton);
                            newPokemonName = newPokemonName.label;
                            let pokemon = Dex.species.get(newPokemonName);
                            if (!pokemon || !pokemon.exists) return;
                            messageObject = await getPokemon({ pokemon: pokemon, genData: genData, learnsetBool: learnsetBool, generation: generationButton, shinyBool: shinyBool, emojis: interaction.client.application.emojis.cache });
                            if (!messageObject) return;
                            embedsReturn = messageObject.embeds;
                            componentsReturn = messageObject.components;
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
                            MHMonstersJSON.monsters.forEach(monster => {
                                if (monster.name == newMonsterName) monsterData = monster;
                            });
                            if (!monsterData) return;
                            messageObject = await getMHMonster(monsterData, interaction.client.application.emojis.cache);
                            if (!messageObject) return;
                            embedsReturn = messageObject.embeds;
                            componentsReturn = messageObject.components;
                        } else if (interaction.customId.startsWith("mhquests")) {
                            // Monster Hunter quests
                            let mhQuestsDirection = customIdSplit[1];
                            let mhQuestsGameName = customIdSplit[2];
                            let mhQuestsPage = customIdSplit[3];
                            let mhQuestsPagesTotal = customIdSplit[4];
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
                            let mhQuestsMessageObject = await getMHQuests({ gameName: mhQuestsGameName, page: mhQuestsPage });
                            embedsReturn = mhQuestsMessageObject.embeds;
                            componentsReturn = mhQuestsMessageObject.components;
                        } else if (interaction.customId.startsWith("splatfest")) {
                            // Splatfest
                            let splatfestDirection = customIdSplit[1];
                            let splatfestPage = customIdSplit[2];
                            let splatfestRegion = customIdSplit[3];
                            switch (splatfestDirection) {
                                case "left":
                                    splatfestPage = parseInt(splatfestPage) + 1;
                                    break;
                                case "right":
                                    splatfestPage = parseInt(splatfestPage) - 1;
                                    break;
                            };
                            let splatfestMessageObject = await getSplatfests({ page: splatfestPage, region: splatfestRegion });
                            contentReturn = splatfestMessageObject.content;
                            embedsReturn = splatfestMessageObject.embeds;
                            componentsReturn = splatfestMessageObject.components;
                        } else if (interaction.customId.includes("minesweeper")) {
                            // Minesweeper
                            if (!isOriginalUser) return sendMessage(notOriginalUserMessageObject);
                            let minesweeperComponentsCopy = interaction.message.components;
                            componentsReturn = [];
                            const bombEmoji = "💣";
                            const spoilerEmoji = "⬛";
                            let matrix = null;
                            let mineRows = minesweeperComponentsCopy.length; // Count rows by counting action rows
                            let mineColumns = minesweeperComponentsCopy[0].components.length; // Count columns by counting buttons in the first row
                            let mineSize = mineRows * mineColumns; // Total tiles
                            let mineCount = parseInt(minesweeperComponentsCopy[0].components[0].data.custom_id.split("-")[3]); // Amount of mines
                            let mineBet = parseInt(minesweeperComponentsCopy[0].components[0].data.custom_id.split("-")[4]); // Bet amount
                            let mineWinAmount = parseInt(minesweeperComponentsCopy[0].components[0].data.custom_id.split("-")[5]); // Money gained on win. In customId instead of recalculated to avoid double hard-coding increase % and unnecessary calculations.
                            // ID will only contain the spoiler emoji as a placeholder when no board has been generated yet
                            let isFirstButton = (minesweeperComponentsCopy[0].components[0].data.custom_id.split("-")[2] == spoilerEmoji);
                            let isLossState = false;
                            let isWinState = false;
                            let gameOver = false;
                            let buttonsClicked = 0;

                            // Check if first click, build board
                            if (isFirstButton) matrix = createBoard(mineRows, mineColumns, mineCount, bombEmoji);
                            for (let rowIndex = 0; rowIndex < mineRows; rowIndex++) {
                                let actionRow = minesweeperComponentsCopy[rowIndex];
                                const rowCopy = ActionRowBuilder.from(actionRow);
                                let rowNew = new ActionRowBuilder();

                                for (let columnIndex = 0; columnIndex < mineColumns; columnIndex++) {
                                    let button = rowCopy.components[columnIndex];
                                    const buttonCopy = ButtonBuilder.from(button);
                                    if (isFirstButton) {
                                        buttonCopy.setCustomId(buttonCopy.data.custom_id.replace(spoilerEmoji, matrix[rowIndex][columnIndex])); // Replace placeholder emoji with generated emoji from above
                                    };
                                    let buttonEmoji = buttonCopy.data.custom_id.split("-")[2];
                                    if (gameOver) buttonCopy.setDisabled(true);
                                    if (button.data.custom_id == interaction.customId) {
                                        // Regenerate board if first button is a bomb or spoiler
                                        let bannedStartingCells = [bombEmoji, spoilerEmoji];
                                        while (bannedStartingCells.includes(buttonEmoji) && isFirstButton) {
                                            matrix = createBoard(mineRows, mineColumns, mineCount, bombEmoji);
                                            buttonEmoji = matrix[rowIndex][columnIndex]; // Needs to be set like this to prevent infinite loop. Can't be centralized into a variable.
                                            if (!bannedStartingCells.includes(buttonEmoji)) {
                                                rowIndex = 6;
                                                columnIndex = 6;
                                            };
                                        };
                                        revealSafeTile(buttonCopy, buttonEmoji);
                                        if (buttonEmoji == bombEmoji) {
                                            buttonCopy.setStyle(ButtonStyle.Danger);
                                            isLossState = true;
                                        };
                                        // Check if game over state has been reached to reset loop to disable all buttons
                                        if ((isLossState || isWinState) && !gameOver) {
                                            gameOver = true;
                                            // Reset loop
                                            rowIndex = 6;
                                            columnIndex = 6;
                                            continue;
                                        };
                                    };
                                    if (buttonEmoji !== bombEmoji && buttonCopy.data.disabled == true) buttonsClicked++;
                                    if (buttonsClicked == (mineSize - mineCount)) {
                                        isWinState = true; // buttonsClicked is incremented later in the loop so check 1 lower
                                        rowIndex = 6;
                                    };
                                    rowNew.addComponents(buttonCopy);
                                };
                                if (rowNew.components.length > 0) componentsReturn.push(rowNew);
                                // Loop reset
                                if (rowIndex > 5) {
                                    rowIndex = -1;
                                    componentsReturn = [];
                                };
                            };
                            // Check if win state
                            let matrixString = "";
                            let currentBalance = null;
                            if (isWinState || (isLossState && mineBet > 0)) currentBalance = await getMoney(interaction.user.id);
                            if (isLossState) {
                                matrixString = getMatrixString(componentsReturn);
                                contentReturn = `## You hit a mine! Game over!`;
                                // Bet doesn't need to be subtracted, this is already done when setting up the bet
                                if (mineBet > 0) contentReturn += `\nYou lost ${mineBet}${globalVars.currency}.\nYour current balance is ${currentBalance}${globalVars.currency}.`;
                                contentReturn += `\n${matrixString}`;
                            } else if (isWinState) {
                                let moneyPrize = mineCount * 10;
                                matrixString = getMatrixString(componentsReturn);
                                contentReturn = `## You won! Congratulations!\n`;
                                if (mineBet > 0) {
                                    contentReturn += `You bet ${mineBet}${globalVars.currency}.`;
                                    moneyPrize = mineWinAmount;
                                };
                                contentReturn += `\nYou received ${moneyPrize}${globalVars.currency}.`;
                                let rewardDataMinesweeper = await rewardMoney({ application: interaction.client.application, userID: interaction.user.id, reward: moneyPrize });
                                if (rewardDataMinesweeper.isSubscriber) contentReturn += `\nYou ${rewardDataMinesweeper.rewardString}`;
                                contentReturn += `\nYour current balance is ${currentBalance + rewardDataMinesweeper.reward}${globalVars.currency}.\n${matrixString}`;
                            } else {
                                contentReturn = interaction.message.content;
                            };
                        } else if (interaction.customId.startsWith("bgd")) {
                            // Trophy shop
                            const offset = parseInt(interaction.customId.substring(3));
                            let trophy_slice = await getTrophyEmbedSlice(offset);
                            embedsReturn = [trophy_slice.embed];
                            componentsReturn = [trophy_slice.components];
                        } else if (interaction.customId.startsWith("usf")) {
                            // Userinfo
                            const data = interaction.customId.match(/usf([0-9]+):([0-9]+)/);
                            const page = parseInt(data[1]);
                            const user = data[2];
                            let userinfo_page = await getUserInfoSlice(interaction, page, { id: user });
                            embedsReturn = [userinfo_page.embeds];
                            componentsReturn = [userinfo_page.components];
                        } else if (interaction.customId.startsWith("btd6BossEvent")) {
                            let bossEventMessageObject = await getBossEvent({ elite: interaction.customId.split("|")[1] == "false", emojis: interaction.client.application.emojis.cache });
                            if (typeof bossEventMessageObject == "string") return;
                            embedsReturn = [bossEventMessageObject.embeds];
                            componentsReturn = [bossEventMessageObject.components];
                        } else {
                            // Other buttons
                            return;
                        };
                        // Force proper arrays
                        if (embedsReturn && !Array.isArray(embedsReturn)) embedsReturn = [embedsReturn];
                        if (componentsReturn) {
                            if (!Array.isArray(componentsReturn)) componentsReturn = [componentsReturn];
                            while (componentsReturn.length > 5) componentsReturn.pop();
                        };
                        if (filesReturn && !Array.isArray(filesReturn)) filesReturn = [filesReturn];
                        if (editOriginalMessage) {
                            try {
                                await interaction.update({ content: contentReturn, embeds: embedsReturn, components: componentsReturn, files: filesReturn });
                            } catch (e) {
                                // console.log(e);
                                return;
                            };
                        } else {
                            try {
                                await interaction.reply({ content: contentReturn, embeds: embedsReturn, components: componentsReturn, files: filesReturn, flags: messageFlags.add(MessageFlags.Ephemeral) });
                            } catch (e) {
                                // console.log(e);
                                return;
                            };
                        };
                        return;
                    case ComponentType.StringSelect:
                        if (interaction.customId == 'role-select') {
                            let serverApi = await import("../database/dbServices/server.api.js");
                            serverApi = await serverApi.default();
                            // Toggle selected role
                            const rolesArray = [];
                            for await (const value of interaction.values) {
                                const roleArrayItem = await interaction.guild.roles.fetch(value);
                                rolesArray.push(roleArrayItem);
                            };
                            if (rolesArray.length < 1) return sendMessage({ interaction: interaction, content: `None of the selected roles are valid.`, flags: messageFlags.add(MessageFlags.Ephemeral) });
                            let adminBool = isAdmin(interaction.guild.members.me);

                            let roleSelectReturnString = "Role toggling results:\n";
                            for await (const role of rolesArray) {
                                let checkRoleEligibility = await serverApi.EligibleRoles.findOne({ where: { role_id: role.id } });
                                if (!checkRoleEligibility) roleSelectReturnString += `❌ ${role} is not available to selfassign anymore.\n`;
                                if (role.managed) roleSelectReturnString += `❌ I can't manage ${role} because it is being automatically managed by an integration.\n`;
                                if (interaction.guild.members.me.roles.highest.comparePositionTo(role) <= 0 && !adminBool) roleSelectReturnString += `❌ I do not have permission to manage ${role}.\n`;
                                try {
                                    if (interaction.member.roles.cache.has(role.id)) {
                                        await interaction.member.roles.remove(role);
                                        roleSelectReturnString += `✅ You no longer have ${role}!\n`;
                                    } else {
                                        await interaction.member.roles.add(role);
                                        roleSelectReturnString += `✅ You now have ${role}!\n`;
                                    };
                                } catch (e) {
                                    roleSelectReturnString += `❌ Failed to toggle ${role}, probably because I lack permissions.\n`;
                                };
                            };
                            return sendMessage({ interaction: interaction, content: roleSelectReturnString, flags: messageFlags.add(MessageFlags.Ephemeral) });
                        } else {
                            // Other select menus
                            return;
                        };
                    default:
                        // Other component types
                        return;
                };
            case InteractionType.ApplicationCommandAutocomplete:
                let focusedOption = interaction.options.getFocused(true);
                console.log(`${interaction.user.username}: ${interaction.commandName} | ${focusedOption.name}`); // #1033, add "if (process.env.DEBUG == 1)" when fixed
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
                    case "amount":
                    case "bet":
                        let currentBalance = await getMoney(interaction.user.id);
                        let balanceHalf = Math.floor(currentBalance / 2);
                        let balanceQuarter = Math.floor(currentBalance / 4);
                        let balanceTenth = Math.floor(currentBalance / 10);
                        let balanceRandom = randomNumber(1, currentBalance);
                        if (balanceTenth > 0) choices.push({ name: `10% (${balanceTenth}${globalVars.currency})`, value: balanceTenth });
                        if (balanceQuarter > 0) choices.push({ name: `25% (${balanceQuarter}${globalVars.currency})`, value: balanceQuarter });
                        if (balanceHalf > 0) choices.push({ name: `50% (${balanceHalf}${globalVars.currency})`, value: balanceHalf });
                        if (balanceHalf > 0) choices.push({ name: `100% (${currentBalance}${globalVars.currency})`, value: currentBalance });
                        // Only add random if there is money, due to way randomization works result can be 1 while balance is 0
                        if (currentBalance > 0) choices.push({ name: `Random`, value: balanceRandom });
                };
                // Unique argument tree
                switch (interaction.commandName) {
                    case "role":
                        switch (focusedOption.name) {
                            case "role":
                                let serverApi = await import("../database/dbServices/server.api.js");
                                serverApi = await serverApi.default();
                                let dbRoles = await serverApi.EligibleRoles.findAll();
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
                                roleObject.forEach(role => {
                                    if (role.name.toLowerCase().includes(focusedOption.value)) choices.push({ name: role.name, value: role.value });
                                });
                                if (focusedOption.value.length == 0 && roleIDs.length == 0) choices.push({ name: "Selfassignable roles have not been set up in this server.", value: "" });
                                break;
                        };
                        break;
                    case "pokemon":
                        let generationInput = interaction.options.getInteger("generation") || Dex.gen;
                        let dexModified = Dex.mod(`gen${generationInput}`);
                        switch (focusedOption.name) {
                            case "pokemon":
                            case "move":
                            case "name":
                                switch (interaction.options.getSubcommand()) {
                                    case "format": // Pokemon selection in format
                                    case "usage":
                                    case "learn":
                                    case "move":
                                    case "pokemon":
                                        if ([focusedOption.name, interaction.options.getSubcommand()].includes("move")) {
                                            // For some reason filtering breaks the original sorted order, sort by name to restore it
                                            // Also filter out typed hidden powers
                                            let moves = dexModified.moves.all().filter(move => move.exists && !move.name.startsWith("Hidden Power ") && !["CAP", "Future"].includes(move.isNonstandard)).sort((a, b) => a.name.localeCompare(b.name));
                                            moves.forEach(move => {
                                                if (normalizeString(move.name).includes(normalizeString(focusedOption.value))) choices.push({ name: move.name, value: move.name });
                                            });
                                            break;
                                        } else {
                                            // For some reason filtering breaks the original sorted order, sort by number to restore it
                                            let pokemonSpecies = dexModified.species.all().filter(species => species.num > 0 && species.exists && !["CAP", "Future"].includes(species.isNonstandard)).sort((a, b) => a.num - b.num);
                                            let usageBool = (interaction.options.getSubcommand() == "usage");
                                            pokemonSpecies.forEach(species => {
                                                let pokemonIdentifier = `${species.num}: ${species.name}`;
                                                if ((normalizeString(pokemonIdentifier).includes(normalizeString(focusedOption.value)))
                                                    && !(usageBool && species.name.endsWith("-Gmax"))) choices.push({ name: pokemonIdentifier, value: species.name });
                                            });
                                            break;
                                        };
                                    case "ability":
                                        // For some reason filtering breaks the original sorted order, sort by name to restore it
                                        let abilities = dexModified.abilities.all().filter(ability => ability.exists && ability.name !== "No Ability" && !["CAP", "Future"].includes(ability.isNonstandard)).sort((a, b) => a.name.localeCompare(b.name));
                                        abilities.forEach(ability => {
                                            if (normalizeString(ability.name).includes(normalizeString(focusedOption.value))) choices.push({ name: ability.name, value: ability.name });
                                        });
                                        break;
                                    case "item":
                                        // For some reason filtering breaks the original sorted order, sort by name to restore it
                                        let items = dexModified.items.all().filter(item => item.exists && !["CAP", "Future"].includes(item.isNonstandard)).sort((a, b) => a.name.localeCompare(b.name));
                                        items.forEach(item => {
                                            if (normalizeString(item.name).includes(normalizeString(focusedOption.value))) choices.push({ name: item.name, value: item.name });
                                        });
                                        break;
                                };
                                break;
                            case "format":
                                let formats = DexSim.formats.all();
                                formats.forEach(format => {
                                    if ((format.id.includes(focusedOption.value.toLowerCase()) || format.name.toLowerCase().includes(focusedOption.value.toLowerCase())) && !format.id.includes("random")) choices.push({ name: format.id, value: format.id });
                                });
                                break;
                            case "rating":
                                let ratings = [0, 1500, 1630, 1760];
                                let formatInput = interaction.options.getString("format");
                                if (formatInput && formatInput.match(/gen.{1,2}(ou)$/g)) ratings = [0, 1500, 1695, 1825];
                                ratings.forEach(rating => {
                                    choices.push({ name: rating.toString(), value: rating });
                                });
                                break;
                            case "card":
                                for await (const card of pokemonCardsAll) {
                                    const pokemonCardSetId = card.id.split("-")[0];
                                    const pokemonCardSet = pokemonCardSetsJSON.find((element) => element.id == pokemonCardSetId);
                                    const pokemonCardReleaseDateSplit = pokemonCardSet.releaseDate.split("/");
                                    const pokemonCardReleaseDate = new Date(pokemonCardReleaseDateSplit[0], pokemonCardReleaseDateSplit[1] - 1, pokemonCardReleaseDateSplit[2]);
                                    const cardOptionString = `${card.name} | ${pokemonCardSet.name} ${card.number}/${pokemonCardSet.printedTotal}`;
                                    if (cardOptionString.toLowerCase().includes(focusedOption.value.toLowerCase())) {
                                        valuesByDate[card.id] = pokemonCardReleaseDate;
                                        choices.push({ name: cardOptionString, value: card.id });
                                    };
                                };
                                break;
                        };
                        break;
                    case "monsterhunter":
                        switch (focusedOption.name) {
                            case "name":
                                switch (interaction.options.getSubcommand()) {
                                    case "monster":
                                        MHMonstersJSON.monsters.forEach(monster => {
                                            if (normalizeString(monster.name).includes(normalizeString(focusedOption.value))) choices.push({ name: monster.name, value: monster.name });
                                        });
                                        break;
                                    case "quest":
                                        MHQuestsJSON.quests.forEach(quest => {
                                            let gameSubtitle = quest.game.replace("Monster Hunter", "").trim();
                                            if (normalizeString(quest.name).includes(normalizeString(focusedOption.value))) choices.push({ name: `${quest.name} (${gameSubtitle})`, value: quest.name });
                                        });
                                        break;
                                };
                                break;
                        };
                        break;
                    case "splatoon":
                        let languageInput = interaction.options.getString("language");
                        if (!languageInput) languageInput = "EUen";
                        let languageJSON = globalVars.splatoon3.languageJSONs[languageInput];
                        switch (focusedOption.name) {
                            case "name":
                                switch (interaction.options.getSubcommand()) {
                                    case "clothing":
                                        let allClothesHead = languageJSON["CommonMsg/Gear/GearName_Head"];
                                        let allClothesBody = languageJSON["CommonMsg/Gear/GearName_Clothes"];
                                        let allClothesShoes = languageJSON["CommonMsg/Gear/GearName_Shoes"];
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
                                            if (normalizeString(value).includes(normalizeString(focusedOption.value)) &&
                                                !key.startsWith("COP00") &&
                                                !key.startsWith("Msn00")) choices.push({ name: value, value: key });
                                        };
                                        break;
                                    case "weapon":
                                        for await (const [key, value] of Object.entries(languageJSON["CommonMsg/Weapon/WeaponName_Main"])) {
                                            if (normalizeString(value).includes(normalizeString(focusedOption.value)) &&
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
                                            if (normalizeString(value).includes(normalizeString(focusedOption.value)) &&
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
                                            if (normalizeString(value).includes(normalizeString(focusedOption.value)) &&
                                                !key.endsWith("_Coop") &&
                                                !key.endsWith("_Mission") &&
                                                !key.endsWith("Sdodr") &&
                                                !key.includes("_Rival") &&
                                                value !== "-" &&
                                                !key.includes("Gachihoko") &&
                                                !key.includes("SpSuperLanding")) choices.push({ name: value, value: key });
                                        };
                                        break;
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
                        let giResponse;
                        switch (focusedOption.name) {
                            case "name":
                                switch (interaction.options.getSubcommand()) {
                                    case "character":
                                        giResponse = await axios.get(`${giAPI}characters/`);
                                        for (const giCharacter of giResponse.data) {
                                            let giCharacterCapitalized = capitalizeString(giCharacter);
                                            if (normalizeString(giCharacterCapitalized).includes(normalizeString(focusedOption.value))) choices.push({ name: giCharacterCapitalized, value: giCharacter });
                                        };
                                        break;
                                    case "weapon":
                                        giResponse = await axios.get(`${giAPI}weapons/`);
                                        for (const giWeapon of giResponse.data) {
                                            let giWeaponCapitalized = capitalizeString(giWeapon);
                                            if (normalizeString(giWeaponCapitalized).includes(normalizeString(focusedOption.value))) choices.push({ name: giWeaponCapitalized, value: giWeapon });
                                        };
                                        break;
                                    case "artifact":
                                        giResponse = await axios.get(`${giAPI}artifacts/`);
                                        for (const giArtifact of giResponse.data) {
                                            let giArtifactCapitalized = capitalizeString(giArtifact);
                                            if (normalizeString(giArtifactCapitalized).includes(normalizeString(focusedOption.value))) choices.push({ name: giArtifactCapitalized, value: giArtifact });
                                        };
                                        break;
                                };
                                break;
                        };
                        break;
                    case "persona":
                        switch (focusedOption.name) {
                            case "name":
                                switch (interaction.options.getSubcommand()) {
                                    case "persona":
                                        for await (const [key, value] of Object.entries(personaMapRoyal)) {
                                            if (normalizeString(key).includes(normalizeString(focusedOption.value))) choices.push({ name: key, value: key });
                                        };
                                        break;
                                    case "skill":
                                        for await (const [key, value] of Object.entries(skillMapRoyal)) {
                                            if (normalizeString(key).includes(normalizeString(focusedOption.value)) &&
                                                value.element !== "trait") choices.push({ name: key, value: key });
                                        };
                                        break;
                                    case "trait":
                                        for await (const [key, value] of Object.entries(skillMapRoyal)) {
                                            if (normalizeString(key).includes(normalizeString(focusedOption.value)) &&
                                                value.element == "trait") choices.push({ name: key, value: key });
                                        };
                                        break;
                                    case "item":
                                        for await (const [key, value] of Object.entries(itemMapRoyal)) {
                                            if (normalizeString(key).includes(normalizeString(focusedOption.value)) &&
                                                !value.skillCard) choices.push({ name: key, value: key });
                                        };
                                        break;
                                };
                                break;
                        };
                        break;
                    case "helldivers":
                        switch (focusedOption.name) {
                            case "name":
                                let planetsResponse = await axios.get(`${apiHelldivers}planets`);
                                let planetsData = planetsResponse.data;
                                for await (const [key, value] of Object.entries(planetsData)) {
                                    if (normalizeString(value.name).includes(normalizeString(focusedOption.value))) choices.push({ name: value.name, value: value.name });
                                };
                                break;
                        };
                        break;
                    case "manager":
                        switch (focusedOption.name) {
                            case "name":
                                let trophies = await getShopTrophies();
                                let temp = '';
                                trophies.forEach(trophy => {
                                    temp = trophy.trophy_id;
                                    if (normalizeString(temp).includes(focusedOption.value)) { choices.push({ name: temp, value: temp }); }
                                });
                                break;
                        };
                        break;
                    case "trophy":
                        switch (focusedOption.name) {
                            case "name":
                                switch (interaction.options.getSubcommand()) {
                                    case "buy":
                                        const buyable_items = await getBuyableShopTrophies(interaction.user.id);
                                        buyable_items.forEach(trophy => {
                                            choices.push({ name: trophy, value: trophy });
                                        });
                                        // if (choices.length == 0) choices.push({ name: "You need more money in order to buy!", value: "1"});
                                        break;
                                    case "info":
                                        let trophies = await getShopTrophies();
                                        let temp = '';
                                        trophies.forEach(trophy => {
                                            temp = trophy.trophy_id;
                                            if (normalizeString(temp).includes(normalizeString(focusedOption.value))) choices.push({ name: temp, value: temp });
                                        });
                                        trophies = await getEventTrophies();
                                        trophies.forEach(trophy => {
                                            temp = trophy.trophy_id;
                                            if (normalizeString(temp).includes(normalizeString(focusedOption.value))) choices.push({ name: temp, value: temp });
                                        });
                                        // if (choices.length == 0) choices.push({ name: "You need more money in order to buy!", value: "1"});
                                        break;
                                };
                                break;
                        };
                        break;
                };
                choices = [... new Set(choices)]; // Remove duplicates, might not work lol
                if (Object.keys(valuesByDate).length > 0) choices.sort((a, b) => valuesByDate[b.value] - valuesByDate[a.value]); // Sort from new to old
                if (choices.length > 25) choices = choices.slice(0, 25); // Max 25 entries
                // Add random suggestion
                let subcommandSuggestRandom = false;
                // Catch is for commands without subcommands, where getSubcommand() errors out instead of returning null.
                try {
                    if (["pokemon", "monster"].includes(interaction.options.getSubcommand())) subcommandSuggestRandom = true;
                } catch (e) {
                    // console.log(e);
                    subcommandSuggestRandom = false;
                };
                if ((["pokemon", "monster"].includes(focusedOption.name) || subcommandSuggestRandom)) {
                    // Only display random suggestion if there enough other choices or value matches "random"
                    if (choices.length == 25) choices.pop();
                    if (choices.length > 5 || normalizeString(focusedOption.value).includes("random")) choices.push({ name: "Random", value: "random" });
                };
                // Empty choices return empty array
                if (choices.length < 1) return interaction.respond([]);
                // Return choices
                try {
                    await interaction.respond(choices);
                } catch (e) {
                    // console.log(e);
                    return;
                };
                return;
            case InteractionType.ModalSubmit:
                let userAvatar = interaction.user.displayAvatarURL(globalVars.displayAvatarSettings);
                switch (interaction.customId) {
                    case "bugReportModal":
                        // Bug report
                        const bugReportTitle = interaction.fields.getTextInputValue('bugReportTitle');
                        const bugReportDescription = interaction.fields.getTextInputValue('bugReportDescription');
                        const bugReportReproduce = interaction.fields.getTextInputValue('bugReportReproduce');
                        const bugReportBehaviour = interaction.fields.getTextInputValue('bugReportBehaviour');
                        const bugReportContext = interaction.fields.getTextInputValue('bugReportContext');
                        let DMChannel = await client.channels.fetch(process.env.DEV_CHANNEL_ID);

                        const bugReportEmbed = new EmbedBuilder()
                            .setColor(globalVars.embedColor)
                            .setTitle(`Bug Report 🐛`)
                            .setTitle(bugReportTitle)
                            .setDescription(bugReportDescription)
                            .setFooter({ text: `${interaction.user.username} (${interaction.user.id})`, iconURL: userAvatar })
                            .addFields([
                                { name: "Reproduce:", value: bugReportReproduce, inline: false },
                                { name: "Expected Behaviour:", value: bugReportBehaviour, inline: false },
                                { name: "Device Context:", value: bugReportContext, inline: false }
                            ]);
                        await DMChannel.send({ content: interaction.user.id, embeds: [bugReportEmbed] });
                        return sendMessage({ interaction: interaction, content: `Thanks for the bug report!\nIf your DMs are open you may get a DM with a follow-up.`, flags: messageFlags.add(MessageFlags.Ephemeral) });
                    case "modMailModal":
                        // Modmail
                        const modMailTitle = interaction.fields.getTextInputValue('modMailTitle');
                        const modMailDescription = interaction.fields.getTextInputValue('modMailDescription');
                        const profileButton = new ButtonBuilder()
                            .setLabel("Profile")
                            .setStyle(ButtonStyle.Link)
                            .setURL(`discord://-/users/${interaction.user.id}`);
                        let profileButtons = new ActionRowBuilder()
                            .addComponents(profileButton);
                        const modMailEmbed = new EmbedBuilder()
                            .setColor(globalVars.embedColor)
                            .setTitle(`Mod Mail 💌`)
                            .setTitle(modMailTitle)
                            .setDescription(modMailDescription)
                            .setFooter({ text: `${interaction.user.username} (${interaction.user.id})`, iconURL: userAvatar });

                        let modmailReturnString = `Your message has been sent to the moderators!\nThey should get back to you soon.\n`;
                        await interaction.guild.safetyAlertsChannel.send({ embeds: [modMailEmbed], components: [profileButtons] });
                        await interaction.user.send({ content: `This is a receipt of your modmail in ${formatName(interaction.guild.name, true)}.`, embeds: [modMailEmbed] })
                            .then(message => modmailReturnString += "You should have received a receipt in your DMs.")
                            .catch(e => modmailReturnString += "Faled to send you a receipt through DMs.");
                        return sendMessage({ interaction: interaction, content: modmailReturnString, flags: messageFlags.add(MessageFlags.Ephemeral) });
                    case pkmQuizModalId:
                        messageFlags.remove(MessageFlags.Ephemeral);
                        if (!interaction.message) return sendMessage({ interaction: interaction, content: "The message this modal belongs to has been deleted.", flags: messageFlags.add(MessageFlags.Ephemeral) });
                        // Prevent overriding winner by waiting to submit answer
                        // This check works by checking if the description is filled, this is only the case if the game has finished
                        let messageDescription = interaction.message.embeds[0].data.description;
                        if (messageDescription && messageDescription.length > 0) return sendMessage({ interaction: interaction, content: "This game has ended already.", flags: messageFlags.add(MessageFlags.Ephemeral) });
                        if (interaction.message.flags.has("Ephemeral")) messageFlags.add(MessageFlags.Ephemeral);
                        // Who's That Pokémon? modal response
                        let pkmQuizButtonID = Array.from(interaction.fields.fields.keys())[0];
                        let pkmQuizCorrectAnswer = pkmQuizButtonID.split("|")[1];
                        // Getting from dex allows aliases
                        const pkmQuizModalGuess = interaction.fields.getTextInputValue(pkmQuizButtonID);
                        // If there are issues with text validation, add normalizeString() to guess here before getting from Dex
                        const pkmQuizModalGuessFormatted = Dex.species.get(pkmQuizModalGuess).name;

                        if (pkmQuizModalGuessFormatted == pkmQuizCorrectAnswer) {
                            let pkmQuizMessageObject = await getWhosThatPokemon({ interaction: interaction, winner: interaction.user, pokemon: pkmQuizCorrectAnswer });
                            interaction.update({ embeds: pkmQuizMessageObject.embeds, files: pkmQuizMessageObject.files, components: pkmQuizMessageObject.components }).catch(e => {
                                // Only saw this be necessary once when edit got blocked by AutoMod, but it caused a crash so still worth catching
                                // Can't reply or followUp because the interaction counts as handled after the above update fails
                                return null;
                            });
                        } else {
                            return sendMessage({ interaction: interaction, content: `${interaction.user} guessed incorrectly: ${inlineCode(pkmQuizModalGuess)}.`, flags: messageFlags });
                        };
                        break;
                };
                return;
            default:
                return;
        };

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};
