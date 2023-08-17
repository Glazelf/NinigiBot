exports.run = async (client, interaction) => {
  const logger = require("../../util/logger");
  // Import globals
  let globalVars = require("../../events/ready");
  try {
    const sendMessage = require("../../util/sendMessage");
    const isAdmin = require("../../util/isAdmin");
    let adminBool = isAdmin(client, interaction.member);

    let ephemeral = false;
    let slowmodeSupportedChannelTypes = [
      "GUILD_TEXT",
      "GUILD_PUBLIC_THREAD",
      "GUILD_PRIVATE_THREAD",
      "GUILD_STAGE_VOICE",
      "GUILD_VOICE",
    ];

    if (!interaction.member.permissions.has("MANAGE_CHANNELS") && !adminBool)
      return sendMessage({
        client: client,
        interaction: interaction,
        content: globalVars.lackPerms,
      });
    if (!slowmodeSupportedChannelTypes.includes(interaction.channel.type))
      return sendMessage({
        client: client,
        interaction: interaction,
        content: `This channel type doesn't support slowmode.`,
      });

    let time = interaction.options.getInteger("time");
    await interaction.channel.setRateLimitPerUser(time);
    return sendMessage({
      client: client,
      interaction: interaction,
      content: `Slowmode set to ${time} seconds.`,
    });
  } catch (e) {
    // Log error
    logger(e, client, interaction);
  }
};

module.exports.config = {
  name: "slowmode",
  description: "Set slowmode in the current channel.",
  options: [
    {
      name: "time",
      type: "INTEGER",
      description: "Time in seconds. 0 to disable.",
      required: true,
      minValue: 0,
      maxValue: 21600,
    },
  ],
};
