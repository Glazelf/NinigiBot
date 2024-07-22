import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import sendMessage from "../sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import axios from "axios";

export default async ({ interaction, page, region }) => {
    let splat3Embed = new EmbedBuilder()
        .setTitle("Splatfests")
        .setColor(globalVars.embedColor)
        .setFooter({ text: "Image is from upcoming or most recent Splatfest." });
    let splatfestButtons = new ActionRowBuilder();
    let splat3EmbedFields = [];
    let pageStartIndex = (page - 1) * 10; // 1 --> 0, 2 --> 10, 3 --> 20, etc.
    let pageEndIndex = page * 10 - 1; // 1 --> 9, 2 --> 19, 3 --> 29, etc.
    let splatfestAPI = `https://splatoon3.ink/data/festivals.json`; // All Splatfest results.
    let responseSplatfest = await axios.get(splatfestAPI);
    if (responseSplatfest.status != 200) return sendMessage({ interaction: interaction, content: `Error occurred getting Splatfest data. Please try again later.` });
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
        // 00014 = Drums|Guitar|Keyboard
        if (splatfest.endTime > splatfestData.find(s => s.__splatoon3ink_id.split("-")[1] == "00014").startTime) currentSplatfestPointValues = {
            horagai: {
                first: 90,
                second: 45
            },
            vote: {
                first: 70,
                second: 35
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
        let splatfestResultsTitle = "**Results:**";
        let splatfestResultsDescription = "";
        let splatfestWinnerPoints = 0;
        let splatfestResultsHoragai = "- Sneak Peek: ";
        let splatfestResultsVote = "- Popularity: ";
        let splatfestResultsRegular = "- Open Battles: ";
        let splatfestResultsChallenge = "- Pro Battles: ";
        let splatfestResultsTricolor = "- Tricolor Battles: ";
        let splatfestResultsWinner = "**Winner: Team {1} ({2}p)**";
        let splatfestTeamIndex = 0;
        let splatfestIdols = {
            0: "Shiver",
            1: "Frye",
            2: "Big Man"
        };
        await splatfest.teams.forEach(async (team) => {
            if (team.teamName.length < 1) team.teamName = splatfestIdols[splatfestTeamIndex]; // In case no valid name in API return
            if (splatfestTeamIndex !== 0) {
                splatfestDescription += " vs. ";
                splatfestResultsVote += " | ";
                splatfestResultsHoragai += " | ";
                splatfestResultsRegular += " | ";
                splatfestResultsChallenge += " | ";
                splatfestResultsTricolor += " | ";
            };
            splatfestTeamIndex++;
            // There has to be a way to clean up most of the if statements in the ~50 lines below this comment
            if (team.result && team.result.isWinner) {
                splatfestDescription += `**${team.teamName}**`;
                if (team.result.isVoteRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.vote.first;
                if (team.result.isVoteRatioSecond) splatfestWinnerPoints += currentSplatfestPointValues.vote.second;
                if (team.result.isHoragaiRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.horagai.first;
                if (team.result.isHoragaiRatioSecond) splatfestWinnerPoints += currentSplatfestPointValues.horagai.second;
                if (team.result.isRegularContributionRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.regular.first;
                if (team.result.isRegularContributionRatioSecond) splatfestWinnerPoints += currentSplatfestPointValues.challenge.second;
                if (team.result.isChallengeContributionRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.challenge.first;
                if (team.result.isChallengeContributionRatioSecond) splatfestWinnerPoints += currentSplatfestPointValues.challenge.second;
                if (team.result.isTricolorContributionRatioTop) splatfestWinnerPoints += currentSplatfestPointValues.tricolor.first;
                if (team.result.isTricolorContributionRatioSecond) splatfestWinnerPoints += currentSplatfestPointValues.tricolor.second;
                splatfestResultsWinner = splatfestResultsWinner.replace("{1}", team.teamName).replace("{2}", splatfestWinnerPoints);
            } else if (team.result && team.result.isSecondWinner) {
                splatfestDescription += `*${team.teamName}*`;
            } else {
                splatfestDescription += team.teamName;
            };
            if (splatfest.state == "CLOSED") {
                // There HAS to be a cleaner way to do this but i don't care enough to figure it out right now, forEach didn't want to work on the object
                if (team.result && team.result.horagaiRatio) {
                    let conchShellResultString = `${Math.round(team.result.horagaiRatio * 10000) / 100}%`;
                    if (team.result.isHoragaiRatioTop) conchShellResultString = `**${conchShellResultString}**`;
                    if (team.result.isHoragaiRatioSecond) conchShellResultString = `*${conchShellResultString}*`;
                    splatfestResultsHoragai += conchShellResultString;
                };
                if (team.result && team.result.voteRatio) {
                    let voteResultString = `${Math.round(team.result.voteRatio * 10000) / 100}%`;
                    if (team.result.isVoteRatioTop) voteResultString = `**${voteResultString}**`;
                    if (team.result.isVoteRatioSecond) voteResultString = `*${voteResultString}*`;
                    splatfestResultsVote += voteResultString;
                };
                if (team.result && team.result.regularContributionRatio) {
                    let regularBattleResultString = `${Math.round(team.result.regularContributionRatio * 10000) / 100}%`;
                    if (team.result.isRegularContributionRatioTop) regularBattleResultString = `**${regularBattleResultString}**`;
                    if (team.result.isRegularContributionRatioSecond) regularBattleResultString = `*${regularBattleResultString}*`;
                    splatfestResultsRegular += regularBattleResultString;
                };
                if (team.result && team.result.challengeContributionRatio) {
                    let proBattleResultString = `${Math.round(team.result.challengeContributionRatio * 10000) / 100}%`;
                    if (team.result.isChallengeContributionRatioTop) proBattleResultString = `**${proBattleResultString}**`;
                    if (team.result.isChallengeContributionRatioSecond) proBattleResultString = `*${proBattleResultString}*`;
                    splatfestResultsChallenge += proBattleResultString;
                };
                if (team.result && team.result.tricolorContributionRatio) {
                    let tricolorBattleResultString = `${Math.round(team.result.tricolorContributionRatio * 10000) / 100}%`;
                    if (team.result.isTricolorContributionRatioTop) tricolorBattleResultString = `**${tricolorBattleResultString}**`;
                    if (team.result.isTricolorContributionRatioSecond) tricolorBattleResultString = `*${tricolorBattleResultString}*`;
                    splatfestResultsTricolor += tricolorBattleResultString;
                };
            };
            if (team.role == "DEFENSE") midTermWinner = team.teamName;
        });
        if (splatfest.teams[0].result) {
            splatfestResultsHoragai += ` (**${currentSplatfestPointValues.horagai.first}p**)`;
            splatfestResultsVote += ` (**${currentSplatfestPointValues.vote.first}p**)`;
            splatfestResultsRegular += ` (**${currentSplatfestPointValues.regular.first}p**)`;
            splatfestResultsChallenge += ` (**${currentSplatfestPointValues.challenge.first}p**)`;
            if (currentSplatfestPointValues.horagai.second) {
                splatfestResultsHoragai = splatfestResultsHoragai.replace(")", ` | *${currentSplatfestPointValues.horagai.second}p*)`);
                splatfestResultsVote = splatfestResultsVote.replace(")", ` | *${currentSplatfestPointValues.vote.second}p*)`);
                splatfestResultsRegular = splatfestResultsRegular.replace(")", ` | *${currentSplatfestPointValues.regular.second}p*)`);
                splatfestResultsChallenge = splatfestResultsChallenge.replace(")", ` | *${currentSplatfestPointValues.challenge.second}p*)`);
            };

            splatfestResultsDescription += `${splatfestResultsHoragai}\n${splatfestResultsVote}\n${splatfestResultsRegular}\n${splatfestResultsChallenge}`;
            if (!midTermWinner && currentSplatfestPointValues.tricolor) {
                splatfestResultsTricolor += ` (**${currentSplatfestPointValues.tricolor.first}p**)`;
                if (currentSplatfestPointValues.tricolor.second) splatfestResultsTricolor = splatfestResultsTricolor.replace(")", ` | *${currentSplatfestPointValues.tricolor.second}p*)`);
                splatfestResultsDescription += `\n${splatfestResultsTricolor}`;
            };
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
    for (let i = pageStartIndex; i <= pageEndIndex; i++) {
        if (splat3EmbedFields[i]) splat3Embed.addFields([splat3EmbedFields[i]]);
    };
    // "Previous" page button. This is actually the next page because of how the splatfests are ordered. Sort of. It goes left.
    const leftButton = new ButtonBuilder()
        .setCustomId(`splatfest|left|${splatfestButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⬅️');
    splatfestButtons.addComponents(leftButton);
    if (!splat3EmbedFields[pageEndIndex + 1]) leftButton.setDisabled(true);
    // Check to add next button (buttons are swapped because we start at newest splatfest and work backwards)
    const rightButton = new ButtonBuilder()
        .setCustomId(`splatfest|right|${splatfestButtonAppend}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('➡️')
    splatfestButtons.addComponents(rightButton);
    if (page < 2) rightButton.setDisabled(true);
    splat3Embed.setImage(splatfestBanner);
    if (!isUpcomingOrOngoingSplatfest) splat3Embed.setDescription("Note: Upcoming Splatfests will only be available here once you can choose a team ingame.\n**Bold** indicates the winning team, *italics* indicates second place.");
    let splatfestMessageObject = { embeds: [splat3Embed], components: splatfestButtons };
    return splatfestMessageObject;
};