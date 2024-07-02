import {
    ContextMenuCommandBuilder,
    ApplicationCommandType
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import logger from "../../util/logger.js";
import getUserInfoSlice from "../../util/userinfo/getUserInfoSlice.js";

export default async (interaction) => {
    try {
        const user = interaction.options.getUser("user");
        const msg = await getUserInfoSlice(interaction, 0, user);
        return sendMessage(msg);
    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("Userinfo")
    .setType(ApplicationCommandType.User);