const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
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
        let unixTime = Math.floor(targetDate.getTime() / 1000);
        const timestampEmbed = new Discord.EmbedBuilder()
            .setColor(client.globalVars.embedColor)
            .setTitle(dateString)
            .addFields([
                { name: "Short Time", value: `\`<t:${unixTime}:t>\` ➡ <t:${unixTime}:t>`, inline: false },
                { name: "Long Time", value: `\`<t:${unixTime}:T>\` ➡ <t:${unixTime}:T>`, inline: false },
                { name: "Short Date", value: `\`<t:${unixTime}:d>\` ➡ <t:${unixTime}:d>`, inline: false },
                { name: "Long Date", value: `\`<t:${unixTime}:D>\` ➡ <t:${unixTime}:D>`, inline: false },
                { name: "Short Date/Time", value: `\`<t:${unixTime}:f>\` ➡ <t:${unixTime}:f>`, inline: false },
                { name: "Long Date/Time", value: `\`<t:${unixTime}:F>\` ➡ <t:${unixTime}:F>`, inline: false },
                { name: "Relative Time", value: `\`<t:${unixTime}:R>\` ➡ <t:${unixTime}:R>`, inline: false }
            ]);
        return sendMessage({ client: client, interaction: interaction, embeds: timestampEmbed, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "timestamp",
    description: `Helps you construct timestamps.`,
    options: [{
        name: "year",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Specify year. Default is current.",
        minValue: 1970
    }, {
        name: "month",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Specify month. Default is current.",
        minValue: 1,
        maxValue: 12
    }, {
        name: "day",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Specify day. Default is current.",
        minValue: 1,
        maxValue: 31
    }, {
        name: "hour",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Specify hour. Default is current.",
        minValue: 0,
        maxValue: 23
    }, {
        name: "minute",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Specify minute. Default is current.",
        minValue: 0,
        maxValue: 59
    }, {
        name: "timezone",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Specify timezone difference from UTC. Default is UTC.",
        minValue: -12,
        maxValue: 12
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};