// @ts-nocheck
import {
    MessageFlags,
    ContextMenuCommandBuilder,
    ApplicationCommandType
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import getUserInfoSlice from "../../util/userinfo/getUserInfoSlice.js";

export default async (interaction, messageFlags) => {
    const user = interaction.options.getUser("user");
    const msg = await getUserInfoSlice(interaction, 0, user);
    msg.flags = messageFlags.add(MessageFlags.Ephemeral);
    return sendMessage(msg);
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("Userinfo")
    .setType(ApplicationCommandType.User);