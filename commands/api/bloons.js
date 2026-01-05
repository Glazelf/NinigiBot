import {
    MessageFlags,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder,
    ActionRowBuilder,
    SlashCommandSubcommandGroupBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import getBossEvent from "../../util/bloons/getBossEvent.js";
import getAPIErrorMessageObject from "../../util/bloons/getAPIErrorMessageObject.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const btd6oakHelp = "https://support.ninjakiwi.com/hc/en-us/articles/13438499873937-Open-Data-API";
const btd6UserModalIdBase = "btd6UserModal";
const btd6UserModal = new ModalBuilder()
    .setCustomId(btd6UserModalIdBase)
    .setTitle("Bloons TD 6 User Info 🎈");
const oakInput = new TextInputBuilder()
    .setCustomId("btd6UserModalOak")
    .setPlaceholder("oak_ab4816c401d194fe13cb (This OAK is fake)")
    .setStyle(TextInputStyle.Short)
    .setMinLength(24)
    .setMaxLength(24)
    .setRequired(true);
const oakLabel = new LabelBuilder()
    .setLabel("Input your OAK.")
    .setDescription(`OAK info: ${btd6oakHelp}`)
    .setTextInputComponent(oakInput);
btd6UserModal.addLabelComponents(oakLabel);

export default async (interaction, messageFlags) => {
    let apiError = null;
    let btd6ActionRow = new ActionRowBuilder();
    let btd6Embed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    switch (interaction.options.getSubcommand()) {
        case "user":
            btd6UserModal.setCustomId(`${btd6UserModalIdBase}|${interaction.options.getBoolean("ephemeral")}`);
            return interaction.showModal(btd6UserModal);
            break;
        case "boss-event":
            await interaction.deferReply({ flags: messageFlags });
            let bossEventMessageObject = await getBossEvent({ elite: false, emojis: interaction.client.application.emojis.cache });
            if (typeof bossEventMessageObject == "string") {
                apiError = bossEventMessageObject;
                break;
            };
            btd6Embed = bossEventMessageObject.embeds;
            btd6ActionRow = bossEventMessageObject.components;
            break;
    };
    // Handle API errors
    if (apiError) {
        messageFlags.add(MessageFlags.Ephemeral);
        btd6Embed = getAPIErrorMessageObject(apiError).embeds[0];
    };
    return sendMessage({ interaction: interaction, embeds: btd6Embed, components: btd6ActionRow, flags: messageFlags });
};

// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const userSubcommand = new SlashCommandSubcommandBuilder()
    .setName("user")
    .setDescription("See information on a user.")
    .addBooleanOption(ephemeralOption);
const bossEventSubcommand = new SlashCommandSubcommandBuilder()
    .setName("boss-event")
    .setDescription("See current boss event.")
    .addBooleanOption(ephemeralOption);
// Subcommand groups
const td6SubcommandGroup = new SlashCommandSubcommandGroupBuilder()
    .setName("td6")
    .setDescription("Shows Bloons Tower Defense 6 data.")
    .addSubcommand(userSubcommand)
    .addSubcommand(bossEventSubcommand);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("bloons")
    .setDescription("Shows Bloons data.")
    .addSubcommandGroup(td6SubcommandGroup);