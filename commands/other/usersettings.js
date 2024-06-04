import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import { setBirthday, getSwitchCode, setSwitchCode, getEphemeralDefault, setEphemeralDefault } from "../../database/dbServices/user.api.js";

export default async (client, interaction) => {
    try {
        switch (interaction.options.getSubcommand()) {
            case "birthday":
                let day = interaction.options.getInteger("day");
                let month = interaction.options.getInteger("month");
                // Birthdays are stored as string DDMM instead of being seperated by a -
                if (day < 10) {
                    day = `0${day}`;
                } else {
                    day = `${day}`;
                };
                if (month < 10) {
                    month = `0${month}`;
                } else {
                    month = `${month}`;
                };
                setBirthday(interaction.user.id, day + month);
                return sendMessage({ client: client, interaction: interaction, content: `Updated your birthday to \`${day}-${month}\` (dd-mm).` });
                break;
            case "switch":
                let switchCodeGet = await getSwitchCode(interaction.user.id);
                let switchFC = interaction.options.getString('switch-fc');
                let invalidString = `Please specify a valid Nintendo Switch friend code.`;
                // Present code if no code is supplied as an argument
                if (!switchFC) {
                    if (switchCodeGet) return sendMessage({ client: client, interaction: interaction, content: `${interaction.user.username}'s Nintendo Switch friend code is ${switchCodeGet}.`, ephemeral: false });
                    return sendMessage({ client: client, interaction: interaction, content: invalidString });
                };
                // Check and sanitize input
                switchFC = /^(?:SW)?[- ]?([0-9]{4})[- ]?([0-9]{4})[- ]?([0-9]{4})$/.exec(switchFC);
                if (!switchFC) return sendMessage({ client: client, interaction: interaction, content: invalidString });
                switchFC = `SW-${switchFC[1]}-${switchFC[2]}-${switchFC[3]}`;
                setSwitchCode(interaction.user.id, switchFC);
                return sendMessage({ client: client, interaction: interaction, content: `Updated your Nintendo Switch friend code to \`${switchFC}\`.` });
                break;
            case "ephemeraldefault":
                // let ephemeralDefaultGet = await getEphemeralDefault(interaction.user.id);
                let ephemeralDefault = interaction.options.getBoolean('ephemeral');
                setEphemeralDefault(interaction.user.id, ephemeralDefault);
                return sendMessage({ client: client, interaction: interaction, content: `Changed the default ephemeral argument on your commands to \`${ephemeralDefault}\`.` });
                break;
        };

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "usersettings",
    description: "Change user settings.",
    options: [{
        name: "birthday",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Update your birthday.",
        options: [{
            name: "day",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Birth day of the month.",
            required: true,
            minValue: 1,
            maxValue: 31
        }, {
            name: "month",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Birth month of the year.",
            required: true,
            minValue: 1,
            maxValue: 12
        }]
    }, {
        name: "switch",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Updates your Switch friend code.",
        options: [{
            name: "switch-fc",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Switch friend code. Example: SW-1234-1234-1234."
        }]
    }, {
        name: "ephemeraldefault",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Change ephemeral default.",
        options: [{
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "New ephemeral default.",
            required: true
        }]
    }]
};