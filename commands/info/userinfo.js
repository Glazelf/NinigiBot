import {
    ContextMenuCommandBuilder,
    ApplicationCommandType
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import getUserInfoSlice from "../../util/userinfo/getUserInfoSlice.js";

export default async (interaction) => {
    const user = interaction.options.getUser("user");
    const msg = await getUserInfoSlice(interaction, 0, user);
    return sendMessage(msg);
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("Userinfo")
    .setType(ApplicationCommandType.User);