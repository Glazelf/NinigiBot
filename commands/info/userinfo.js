import Discord from "discord.js";
import sendMessage from "../../util/sendMessage";
import logger from "../../util/logger";
import getUserInfoSlice from "../../util/userinfo/getUserInfoSlice";

export default async (client, interaction) => {
    try {
        const user = interaction.options.getUser("user");
        const msg = await getUserInfoSlice(client, interaction, 0, user);
        return sendMessage(msg);
    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "Userinfo",
    type: Discord.ApplicationCommandType.User
};