module.exports = async ({ client, interaction, page, region }) => {
    try {
        const sendMessage = require('../sendMessage');
        const Discord = require("discord.js");
        const axios = require("axios");
        let splat3Embed = new Discord.EmbedBuilder()
            .setTitle("Splatfests")
            .setColor(client.globalVars.embedColor)
            .setFooter({ text: "Image is from upcoming or most recent Splatfest." });
        let splatfestButtons = new Discord.ActionRowBuilder();
        let splat3EmbedFields = [];
        let pageStartIndex = (page - 1) * 10; // 1 --> 0, 2 --> 10, 3 --> 20, etc.
        let pageEndIndex = page * 10 - 1; // 1 --> 9, 2 --> 19, 3 --> 29, etc.
        let splatfestAPI = `https://splatoon3.ink/data/festivals.json`; // All Splatfest results.
        let responseSplatfest = await axios.get(splatfestAPI);
        if (responseSplatfest.status != 200) return sendMessage({ client: client, interaction: interaction, content: `Error occurred getting Splatfest data. Please try again later.` });
        let splatfestData = responseSplatfest.data[region].data.festRecords.nodes;
        let splatfestBanner = null;
        let isUpcomingOrOngoingSplatfest = false;
        let pointValues = {
            vote: { // Popularity
                first: 10
            },
            horagai: { // Conch Shells
                first: 10
            },
            regular: { // Open
                first: 15
            },
            challenge: { // Pro
                first: 10
            }
        };
        splatfestData = await splatfestData.sort((a, b) => Date.parse(b.endTime) - Date.parse(a.endTime));
        await splatfestData.forEach(async (splatfest) => {
            if (splatfest.title.length < 1) splatfest.title = "Unknown Splatfest (API error)"; // In case no valid name in API return
            let currentSplatfestPointValues = pointValues;
            // First check is for the first Splatfest system revamp, teams from here on out don't have the splatfest.teams.role (midterm winner) property
            // 00003 = Spicy|Sweet|Sour
            if (splatfest.endTime > splatfestData.find(s => s.__splatoon3ink_id.split("-")[1] == "00003").startTime) currentSplatfestPointValues = {
                vote: {
                    first: 10
                },
                horagai: {
                    first: 8
                },
                regular: {
                    first: 12
                },
                challenge: {
                    first: 12
                },
                tricolor: {
                    first: 15
                }
            };
            // Second check is for a minor points change
            // 00005 = Nessie|Aliens|Bigfoot
            if (splatfest.endTime > splatfestData.find(s => s.__splatoon3ink_id.split("-")[1] == "00005").startTime) currentSplatfestPointValues = {
                vote: {
                    first: 8
                },
                horagai: {
                    first: 7
                },
                regular: {
                    first: 12
                },
                challenge: {
                    first: 12
                },
                tricolor: {
                    first: 18
                }
            };
            // Bigger points overhaul
            // 00014 = next splatfest
            if (splatfest.endTime > splatfestData.find(s => s.__splatoon3ink_id.split("-")[1] == "00014").startTime) currentSplatfestPointValues = {
                vote: {
                    first: 70,
                    second: 35
                },
                horagai: {
                    first: 90,
                    second: 45
                },
                regular: {
                    first: 120,
                    second: 60
                },
                challenge: {
                    first: 120,
                    second: 60
                },
                tricolor: {
                    first: 180,
                    second: 90
                }
            };
            let splatfestTitle = splatfest.title;
            let splatfestDescription = "";
            if (!splatfestBanner) splatfestBanner = splatfest.image.url;
            switch (splatfest.state) {
                case "SCHEDULED":
                    splatfestTitle = `⚠️UPCOMING⚠️\n${splatfestTitle}`;
                    isUpcomingOrOngoingSplatfest = true;
                    break;
                case "FIRST_HALF":
                case "SECOND_HALF":
                    splatfestTitle = `🥳ONGOING🥳\n${splatfestTitle}`;
                    isUpcomingOrOngoingSplatfest = true;
                    break;
                case "CLOSED":
                    break;
                default:
                    break;
            };
            let midTermWinner = null;
            let splatfestResultsTitle = "**Results:** ({1})";
            let splatfestResultsTitleTeams = "";
            let splatfestResultsDescription = "";
            let splatfestWinnerPoints = 0;
            let splatfestResultsVote = "- Popularity: ";
            let splatfestResultsHoragai = "- Conch Shells: ";
            let splatfestResultsRegular = "- Open Battles: ";
            let splatfestResultsChallenge = "- Pro Battles: ";
            let splatfestResultsTricolor = "- Tricolor Battles: ";
            let splatfestResultsWinner = "**Winner: Team {1} ({2}p)**";
            splatfestTeamIndex = 0;
            let splatfestIdols = {
                0: "Shiver",
                1: "Frye",
                2: "Big Man"
            };
            await splatfest.teams.forEach(async (team) => {
                if (team.teamName.length < 1) team.teamName = splatfestIdols[splatfestTeamIndex]; // In case no valid name in API return
                if (splatfestTeamIndex !== 0) {
                    splatfestDescription += " vs. ";
                    splatfestResultsTitleTeams += "|";
                    splatfestResultsVote += "|";
                    splatfestResultsHoragai += "|";
                    splatfestResultsRegular += "|";
                    splatfestResultsChallenge += "|";
                    splatfestResultsTricolor += "|";
                };
                splatfestTeamIndex++;
                if (team.result && team.result.isWinner) {
                    splatfestDescription += `**${team.teamName}**`;
                    splatfestResultsTitleTeams += `**${team.teamName}**`;
                    if (team.result.isVoteRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.vote.first;
                    if (team.result.isHoragaiRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.horagai.first;
                    if (team.result.isRegularContributionRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.regular.first;
                    if (team.result.isChallengeContributionRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.challenge.first;
                    if (team.result.isTricolorContributionRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.tricolor.first;
                    splatfestResultsWinner = splatfestResultsWinner.replace("{1}", team.teamName).replace("{2}", splatfestWinnerPoints);
                } else {
                    splatfestDescription += team.teamName;
                    splatfestResultsTitleTeams += team.teamName;
                };
                if (splatfest.state == "CLOSED") {
                    // There HAS to be a cleaner way to do this but i don't care enough to figure it out right now, forEach didn't want to work on the object
                    if (team.result && team.result.voteRatio) {
                        let voteResultString = `${Math.round(team.result.voteRatio * 10000) / 100}%`;
                        if (team.result.isVoteRatioTop) voteResultString = `**${voteResultString}**`;
                        splatfestResultsVote += voteResultString;
                    };
                    if (team.result && team.result.horagaiRatio) {
                        let conchShellResultString = `${Math.round(team.result.horagaiRatio * 10000) / 100}%`;
                        if (team.result.isHoragaiRatioTop) conchShellResultString = `**${conchShellResultString}**`;
                        splatfestResultsHoragai += conchShellResultString;
                    };
                    if (team.result && team.result.regularContributionRatio) {
                        let regularBattleResultString = `${Math.round(team.result.regularContributionRatio * 10000) / 100}%`;
                        if (team.result.isRegularContributionRatioTop) regularBattleResultString = `**${regularBattleResultString}**`;
                        splatfestResultsRegular += regularBattleResultString;
                    };
                    if (team.result && team.result.challengeContributionRatio) {
                        let proBattleResultString = `${Math.round(team.result.challengeContributionRatio * 10000) / 100}%`;
                        if (team.result.isChallengeContributionRatioTop) proBattleResultString = `**${proBattleResultString}**`;
                        splatfestResultsChallenge += proBattleResultString;
                    };
                    if (team.result && team.result.tricolorContributionRatio) {
                        let tricolorBattleResultString = `${Math.round(team.result.tricolorContributionRatio * 10000) / 100}%`;
                        if (team.result.isTricolorContributionRatioTop) tricolorBattleResultString = `**${tricolorBattleResultString}**`;
                        splatfestResultsTricolor += tricolorBattleResultString;
                    };
                };
                if (team.role == "DEFENSE") midTermWinner = team.teamName;
            });
            if (splatfest.teams[0].result) {
                splatfestResultsTitle = splatfestResultsTitle.replace("{1}", splatfestResultsTitleTeams);
                splatfestResultsDescription += `${splatfestResultsVote} (${currentSplatfestPointValues.vote.first}p)\n${splatfestResultsHoragai} (${currentSplatfestPointValues.horagai.first}p)\n${splatfestResultsRegular} (${currentSplatfestPointValues.regular.first}p)\n${splatfestResultsChallenge} (${currentSplatfestPointValues.challenge.first}p)`;
                if (!midTermWinner && currentSplatfestPointValues.tricolor) splatfestResultsDescription += `\n${splatfestResultsTricolor} (${currentSplatfestPointValues.tricolor.first}p)`;
                splatfestResultsDescription += `\n${splatfestResultsWinner}`;
            };
            splatfestDescription += `\n<t:${Date.parse(splatfest.startTime) / 1000}:d>-<t:${Date.parse(splatfest.endTime) / 1000}:d>`;
            if (midTermWinner) splatfestDescription += `\nTricolor Defense: Team ${midTermWinner}`;
            if (splatfest.teams[0].result) splatfestDescription += `\n${splatfestResultsTitle}\n${splatfestResultsDescription}`;
            // Character limit per embed is 6000. Paginate this sometime. For now show 10 most recent Splatfests.
            splat3EmbedFields.push({ name: splatfestTitle, value: splatfestDescription, inline: false });
        });
        let splatfestButtonAppend = `${page}|${region}`;
        // Probably cleaner to just add the fields to the embed in the loop above but this is fine for now. 
        for (i = pageStartIndex; i <= pageEndIndex; i++) {
            if (splat3EmbedFields[i]) splat3Embed.addFields([splat3EmbedFields[i]]);
        };
        // "Previous" page button
        if (splat3EmbedFields[pageEndIndex + 1]) {
            splatfestButtons.addComponents(new Discord.ButtonBuilder({ customId: `splatfest|left|${splatfestButtonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '⬅️' }));
        };
        if (page > 1) { // Check to add next button (buttons are swapped because we start at newest splatfest and work backwards)
            splatfestButtons.addComponents(new Discord.ButtonBuilder({ customId: `splatfest|right|${splatfestButtonAppend}`, style: Discord.ButtonStyle.Primary, emoji: '➡️' }));
        };
        splat3Embed.setImage(splatfestBanner);
        if (!isUpcomingOrOngoingSplatfest) splat3Embed.setDescription("Note: Upcoming Splatfests will only be available here once you can choose a team ingame.");
        let splatfestMessageObject = { embeds: splat3Embed, components: [splatfestButtons] };
        return splatfestMessageObject;

    } catch (e) {
        // Log error
        const logger = require('../logger');

        logger(e, client);
    };
};