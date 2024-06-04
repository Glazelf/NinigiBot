import Discord from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import logger from "../../util/logger.js";
import getUserInfoSlice from "../../util/userinfo/getUserInfoSlice.js";

export default async (client, interaction) => {
    try {
        const user = interaction.options.getUser("user");
        const msg = await getUserInfoSlice(client, interaction, 0, user);
        return sendMessage(msg);
    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "Userinfo",
    type: Discord.ApplicationCommandType.User
};