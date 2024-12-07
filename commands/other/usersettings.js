import {
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    bold
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import {
    setBirthday,
    getSwitchCode,
    setSwitchCode,
    // getEphemeralDefault,
    setEphemeralDefault
} from "../../database/dbServices/user.api.js";
import leadingZeros from "../../util/leadingZeros.js";
import formatName from "../../util/discord/formatName.js";

export default async (interaction) => {
    switch (interaction.options.getSubcommand()) {
        case "birthday":
            let day = interaction.options.getInteger("day");
            let month = interaction.options.getInteger("month");
            // Birthdays are stored as string DDMM instead of being seperated by a -
            day = leadingZeros(day, 2);
            month = leadingZeros(month, 2);
            setBirthday(interaction.user.id, day + month);
            return sendMessage({ interaction: interaction, content: `Updated your birthday to \`${day}-${month}\` (dd-mm).` });
        case "switch":
            let switchCodeGet = await getSwitchCode(interaction.user.id);
            let switchFC = interaction.options.getString('switch-fc');
            let invalidString = `Please specify a valid Nintendo Switch friend code.`;
            // Present code if no code is supplied as an argument
            if (!switchFC) {
                if (switchCodeGet) return sendMessage({ interaction: interaction, content: `${formatName(interaction.user.username)}'s Nintendo Switch friend code is ${bold(switchCodeGet)}.`, ephemeral: false });
                return sendMessage({ interaction: interaction, content: invalidString });
            };
            // Check and sanitize input
            switchFC = /^(?:SW)?[- ]?([0-9]{4})[- ]?([0-9]{4})[- ]?([0-9]{4})$/.exec(switchFC);
            if (!switchFC) return sendMessage({ interaction: interaction, content: invalidString });
            switchFC = `SW-${switchFC[1]}-${switchFC[2]}-${switchFC[3]}`;
            setSwitchCode(interaction.user.id, switchFC);
            return sendMessage({ interaction: interaction, content: `Updated your Nintendo Switch friend code to \`${switchFC}\`.` });
        case "ephemeraldefault":
            // let ephemeralDefaultGet = await getEphemeralDefault(interaction.user.id);
            let ephemeralDefault = interaction.options.getBoolean('ephemeral');
            setEphemeralDefault(interaction.user.id, ephemeralDefault);
            return sendMessage({ interaction: interaction, content: `Changed the default ephemeral argument on your commands to \`${ephemeralDefault}\`.` });
    };
};

// String options
const switchFCOption = new SlashCommandStringOption()
    .setName("switch-fc")
    .setDescription("Switch friend code. Example: SW-1234-5678-9012.")
    .setMinLength(14)
    .setMaxLength(17);
// Integer options
const dayOption = new SlashCommandIntegerOption()
    .setName("day")
    .setDescription("Day of the month.")
    .setMinValue(1)
    .setMaxValue(31)
    .setRequired(true);
const monthOption = new SlashCommandIntegerOption()
    .setName("month")
    .setDescription("Month of the year.")
    .setMinValue(1)
    .setMaxValue(12)
    .setRequired(true);
// Boolean options
const ephemeralDefaultOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription("New ephemeral default.")
    .setRequired(true);
// Subcommands
const birthdaySubcommand = new SlashCommandSubcommandBuilder()
    .setName("birthday")
    .setDescription("Update your birthday.")
    .addIntegerOption(dayOption)
    .addIntegerOption(monthOption);
const switchSubcommand = new SlashCommandSubcommandBuilder()
    .setName("switch")
    .setDescription("Share or update your Switch friend code.")
    .addStringOption(switchFCOption);
const ephemeralDefaultSubcommand = new SlashCommandSubcommandBuilder()
    .setName("ephemeraldefault")
    .setDescription("Update default ephemerality.")
    .addBooleanOption(ephemeralDefaultOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("usersettings")
    .setDescription("Change user settings.")
    .addSubcommand(birthdaySubcommand)
    .addSubcommand(switchSubcommand)
    .addSubcommand(ephemeralDefaultSubcommand);