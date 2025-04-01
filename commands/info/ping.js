import {
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";

export default async (interaction, messageFlags) => {
    let SKUs = await interaction.client.application.fetchSKUs();
    console.log(SKUs)
    let commandPing = Math.abs(Date.now() - interaction.createdTimestamp);
    let websocketPing = Math.abs(interaction.client.ws.ping);
    let replyString = `Pong!\n- Websocket ping is ${websocketPing}ms.\n- Command ping is ${commandPing}ms.`;
    return sendMessage({ interaction: interaction, content: replyString, flags: messageFlags.add(MessageFlags.Ephemeral) });
};

export const commandObject = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings bot.");