import {
    ChatInputCommandInteraction,
    MessageFlags,
    MessageFlagsBitField,
    SlashCommandBuilder,
    TextDisplayBuilder
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";

export default async (interaction: ChatInputCommandInteraction, messageFlags: MessageFlagsBitField) => {
    let commandPing = Math.abs(Date.now() - interaction.createdTimestamp);
    let websocketPing = Math.abs(interaction.client.ws.ping);
    let replyTextComponent = new TextDisplayBuilder()
        .setContent(`Pong!\n- Websocket ping is ${websocketPing}ms.\n- Command ping is ${commandPing}ms.`);
    // @ts-ignore
    return sendMessage({ interaction: interaction, components: [replyTextComponent], flags: messageFlags.add(MessageFlags.Ephemeral) });
};

export const commandObject = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings bot.");