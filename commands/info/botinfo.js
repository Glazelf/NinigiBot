import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import urlExists from "../../util/urlExists.js";
import axios from "axios";
import isOwner from "../../util/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import packageJSON from "../../package.json" with { type: "json" };

const owner = "glazelf";
const emojiMax = 2000;

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral }); // Sometimes the various guild fetches and axios calls make this command time out by a few tenths of seconds

    let DiscordJSVersion = packageJSON.dependencies["discord.js"].substring(1,); // Substring is because string starts with ^
    if (DiscordJSVersion.includes("dev")) DiscordJSVersion = DiscordJSVersion.split("dev")[0] + "dev";
    let memoryUsage = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100}MB`;

    let emojis = await interaction.client.application.emojis.fetch();
    await interaction.client.guilds.fetch();
    let totalMembers = await getTotalUsers(interaction.client.guilds);
    // Get latest commit
    let githubURLVars = "Glazelf/NinigiBot";
    let githubRepoURL = `https://api.github.com/repos/${githubURLVars}`;
    let githubMasterURL = `https://api.github.com/repos/${githubURLVars}/branches/master`;
    let githubRepoExists = urlExists(githubRepoURL);
    let githubMasterExists = urlExists(githubMasterURL);
    let githubRepoResponse = null;
    let githubMasterResponse = null;
    if (githubRepoExists) githubRepoResponse = await axios.get(githubRepoURL);
    if (githubMasterExists) githubMasterResponse = await axios.get(githubMasterURL);
    // Timestamps are divided by 1000 to convert from milliseconds (unix) to seconds (Disord timestamps)
    let createdAt = Math.floor(interaction.client.user.createdAt.valueOf() / 1000);
    let date = Date.now();
    let onlineSince = Math.floor((date - interaction.client.uptime) / 1000);
    let lastCommitTimestamp = Math.floor(new Date(githubMasterResponse.data.commit.commit.author.date).getTime() / 1000);

    let lastCommitMessage = `"[${githubMasterResponse.data.commit.commit.message.split("\n")[0]}](https://github.com/${githubURLVars}/commit/${githubMasterResponse.data.commit.sha})"`;
    let lastCommitAuthor = `-[${githubMasterResponse.data.commit.author.login}](https://github.com/${githubMasterResponse.data.commit.author.login})`;
    let lastCommitString = `${lastCommitMessage}\n${lastCommitAuthor}\n<t:${lastCommitTimestamp}:R>`;

    let avatar = interaction.client.user.displayAvatarURL(globalVars.displayAvatarSettings);

    // SKU
    let shopButtonText = "Donate";
    let SKUID = ""; // Without SKU ID link goes to store page
    let shopButtonLink = `https://discord.com/application-directory/${interaction.client.user.id}/store/${SKUID}`;

    let ownerBool = await isOwner(interaction.client, interaction.user);
    let developmentString = `Owner: ${owner}\nLibrary: Discord.JS v${DiscordJSVersion}\nShards: ${interaction.client.options.shardCount}`;
    if (ownerBool) developmentString += `\nMemory Usage: ${memoryUsage}`;
    developmentString += `\nOnline Since: <t:${onlineSince}:R>`;

    let botEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(interaction.client.user.username)
        .setThumbnail(avatar)
        .setDescription(`${githubRepoResponse.data.description}\nCreated at <t:${createdAt}:f>`)
        .addFields([
            { name: "Development:", value: developmentString, inline: true },
            { name: "Stats:", value: `User Installs: ${interaction.client.application.approximateUserInstallCount}\nServers: ${interaction.client.application.approximateGuildCount}\nTotal Members: ${totalMembers}\nEmojis: ${emojis.size}/${emojiMax}\nGithub Stars: [${githubRepoResponse.data.stargazers_count}](https://github.com/${githubURLVars}/stargazers)⭐`, inline: true },
            { name: "Latest Commit:", value: lastCommitString, inline: false }
        ]);

    const shopButton = new ButtonBuilder()
        .setLabel(shopButtonText)
        .setStyle(ButtonStyle.Link)
        .setURL(shopButtonLink);
    const appDirectoryButton = new ButtonBuilder()
        .setLabel("App Directory")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/application-directory/${interaction.client.user.id}`);
    // const githubButton = new ButtonBuilder()
    //     .setLabel("GitHub")
    //     .setStyle(ButtonStyle.Link)
    //     .setURL(`https://github.com/${githubURLVars}`);
    // const supportServerButton = new ButtonBuilder()
    //     .setLabel("Support Server")
    //     .setStyle(ButtonStyle.Link)
    //     .setURL(`https://discord.gg/${globalVars.ShinxServerInvite}`);
    const inviteButton = new ButtonBuilder()
        .setLabel("Add Bot") // "Add" over "Invite" as bots can be added to users now 
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}`);
    let botButtons = new ActionRowBuilder()
        .addComponents([shopButton, appDirectoryButton, inviteButton]);
    return sendMessage({ interaction: interaction, embeds: botEmbed, components: botButtons, ephemeral: ephemeral });
};

async function getTotalUsers(guilds) {
    // Fast but inaccurate method
    let userCount = 0;
    await guilds.cache.forEach(guild => {
        if (guild.memberCount) userCount += guild.memberCount;
    });
    return userCount;
};

// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Displays info about this bot.")
    .addBooleanOption(ephemeralOption);