import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption,
    time,
    TimestampStyles
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    // Date manipulation
    let currentDate = new Date();
    let targetDate = new Date();
    let year = interaction.options.getInteger("year");
    if (year === null) {
        targetDate.setUTCFullYear(currentDate.getUTCFullYear());
    } else {
        targetDate.setFullYear(year);
    };
    let month = interaction.options.getInteger("month");
    if (month === null) {
        targetDate.setUTCMonth(currentDate.getUTCMonth());
    } else {
        targetDate.setMonth(month - 1);
    };
    let day = interaction.options.getInteger("day");
    if (day === null) {
        targetDate.setUTCDate(currentDate.getUTCDate());
    } else {
        targetDate.setDate(day);
    };
    let hour = interaction.options.getInteger("hour");
    if (hour === null) {
        targetDate.setUTCHours(currentDate.getUTCHours());
    } else {
        targetDate.setHours(hour);
    };
    let minute = interaction.options.getInteger("minute");
    if (minute === null) {
        targetDate.setUTCMinutes(currentDate.getUTCMinutes());
    } else {
        targetDate.setMinutes(minute);
    };
    targetDate.setUTCSeconds(0);
    targetDate.setUTCMilliseconds(0);
    let timezone = interaction.options.getInteger("timezone");
    if (timezone === null) timezone = 0;
    if (timezone != 0) targetDate.setTime(targetDate.getTime() + (timezone * 60 * 60 * 1000)); // Add timezone difference
    let dateString = `${currentDate.getUTCDate()} ${targetDate.toLocaleString('default', { month: 'long' })} ${targetDate.getUTCFullYear()} at ${targetDate.getUTCHours()}:${targetDate.getUTCMinutes()} UTC`;
    if (timezone != 0) dateString += `${timezone > 0 ? "+" : ""}${timezone}`;
    const unixTime = Math.floor(targetDate.getTime() / 1000);
    const shortTime = time(unixTime, TimestampStyles.ShortTime);
    const longTime = time(unixTime, TimestampStyles.LongTime);
    const shortDate = time(unixTime, TimestampStyles.ShortDate);
    const longDate = time(unixTime, TimestampStyles.LongDate);
    const shortDateTime = time(unixTime, TimestampStyles.ShortDateTime);
    const longDateTime = time(unixTime, TimestampStyles.LongDateTime);
    const relativeTime = time(unixTime, TimestampStyles.RelativeTime);
    const timestampEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(dateString)
        .addFields([
            { name: "Short Time", value: `\`${shortTime}\` ➡ ${shortTime}`, inline: false },
            { name: "Long Time", value: `\`${longTime}\` ➡ ${longTime}`, inline: false },
            { name: "Short Date", value: `\`${shortDate}\` ➡ ${shortDate}`, inline: false },
            { name: "Long Date", value: `\`${longDate}\` ➡ ${longDate}`, inline: false },
            { name: "Short Date/Time", value: `\`${shortDateTime}\` ➡ ${shortDateTime}`, inline: false },
            { name: "Long Date/Time", value: `\`${longDateTime}\` ➡ ${longDateTime}`, inline: false },
            { name: "Relative Time", value: `\`${relativeTime}\` ➡ ${relativeTime}`, inline: false }
        ]);
    return sendMessage({ interaction: interaction, embeds: timestampEmbed, ephemeral: ephemeral });
};

// Integer options
const yearOption = new SlashCommandIntegerOption()
    .setName("year")
    .setDescription("Specify year. Default is current.")
    .setMinValue(1970);
const monthOption = new SlashCommandIntegerOption()
    .setName("month")
    .setDescription("Specify month. Default is current.")
    .setMinValue(1)
    .setMaxValue(12);
const dayOption = new SlashCommandIntegerOption()
    .setName("day")
    .setDescription("Specify day. Default is current")
    .setMinValue(1)
    .setMaxValue(31);
const hourOption = new SlashCommandIntegerOption()
    .setName("hour")
    .setDescription("Specify hour. Default is current.")
    .setMinValue(0)
    .setMaxValue(23);
const minuteOption = new SlashCommandIntegerOption()
    .setName("minute")
    .setDescription("Specify minute. Default is current.")
    .setMinValue(0)
    .setMaxValue(59);
const timezoneOption = new SlashCommandIntegerOption()
    .setName("timezone")
    .setDescription("Specify difference from UTC. Default is 0.")
    .setMinValue(-12)
    .setMaxValue(12);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("timestamp")
    .setDescription("Helps you construct timestamps.")
    .addIntegerOption(yearOption)
    .addIntegerOption(monthOption)
    .addIntegerOption(dayOption)
    .addIntegerOption(hourOption)
    .addIntegerOption(minuteOption)
    .addIntegerOption(timezoneOption)
    .addBooleanOption(ephemeralOption);