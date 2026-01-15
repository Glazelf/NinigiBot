import {
    MessageFlags,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandUserOption,
    bold
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import ShinxBattle from "../../util/shinx/shinxBattle.js";
import addLine from "../../util/battle/addLine.js";
import isGuildDataAvailable from "../../util/discord/isGuildDataAvailable.js";
import {
    getShinx,
    getShinxAutofeed,
    autoFeedShinx1,
    autoFeedShinx2,
    saveBattle
} from "../../database/dbServices/shinx.api.js";
import { incrementCombatAmount } from "../../database/dbServices/history.api.js";
import formatName from "../../util/discord/formatName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction: any, messageFlags: any) => {
    // Every subcommand here except maybe "play" should be accessible in DMs honestly but I don't feel like rewriting them significantly for now to actually allow for that
    let shinx;
    let returnString = "";
    // Only create userFinder if guild data exists
    let userFinder = null;
    let guildDataAvailable = isGuildDataAvailable(interaction);
    if (guildDataAvailable) {
        userFinder = await interaction.guild.members.fetch().catch(e => { return null; });
        if (!userFinder) userFinder = interaction.guild.members.cache;
    };

    let master = interaction.user;
    // Auto feed
    let auto_feed = await getShinxAutofeed(master.id);
    if (auto_feed > 0) {
        if (auto_feed == 1) {
            await autoFeedShinx1(master.id);
        } else {
            await autoFeedShinx2(master.id);
        };
    };
    switch (interaction.options.getSubcommand()) {
        case "setLevel":
            shinx = await getShinx(master.id);
            shinx.setLevel(interaction.options.getInteger("level"));
            returnString = `Your Shinx is now level ${shinx.getLevel()}.`;
            return sendMessage({ interaction: interaction, content: returnString, flags: messageFlags });
        case "battleWon":
            let target = interaction.options.getUser("user");
            const trainers = [interaction.user, target];
            if (globalVars.battling.yes) return sendMessage({ interaction: interaction, content: `Theres already a battle going on.`, flags: messageFlags.add(MessageFlags.Ephemeral) });
            let shinxes = [];

            for (let i = 0; i < 2; i++) {
                const shinx = await getShinx(trainers[i].id);
                shinxes.push(new ShinxBattle(trainers[i], shinx));
            };

            messageFlags.remove(MessageFlags.Ephemeral);

            globalVars.battling.yes = true;
            let text = '';

            const nicks = [];
            for (let i = 0; i < 2; i++) nicks.push(`${shinxes[i].owner.username}'s ${shinxes[i].nick}`);

            i = 0;
            text += addLine(`${formatName(nicks[(i + 1) % 2], true)} fainted!`);
            for (let h = 0; h < 2; h++) {
                await incrementCombatAmount(trainers[h].id, i == h);
                const exp = shinxes[h].gainExperience(shinxes[(h + 1) % 2].level as any, i !== h);
                text += addLine(`${formatName(nicks[h], true)} won ${exp[0]} exp. points!`);
                if (exp[1] > 0) {
                    text += addLine(`${formatName(nicks[h], true)} grew to level ${bold(shinxes[h].level as any)}!`);
                };
            };
            for (let p = 0; p < 2; p++) await saveBattle(shinxes[p], p === i);
            globalVars.battling.yes = false;
            return sendMessage({ interaction: interaction, content: text });
    };
};

// Level and Shiny subcommands are missing on purpose
// Integer options
const levelOption = new SlashCommandIntegerOption()
    .setName("level")
    .setDescription("level to set.")
    .setMinValue(1)
    .setRequired(true);
// User options
const userOption = new SlashCommandUserOption()
    .setName("user")
    .setDescription("Specify user to battle.")
    .setRequired(true);
const levelSubcommand = new SlashCommandSubcommandBuilder()
    .setName("setlevel")
    .setDescription("Set your shinx to specific level.")
    .addIntegerOption(levelOption);
const battleWonSubcommand = new SlashCommandSubcommandBuilder()
    .setName("battlewon")
    .setDescription("Simulate a battle won.")
    .addUserOption(userOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("shinxdebug")
    .setDescription("Interact with your Shinx as a debugger.")
    .addSubcommand(levelSubcommand)
    .addSubcommand(battleWonSubcommand)