import { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import sendMessage from "../../util/sendMessage.js";

export default async (interaction) => {
    let perms = new PermissionsBitField().add(PermissionFlagsBits.KickMembers).toArray();
    console.log(PermissionFlagsBits[PermissionFlagsBits.KickMembers])

    console.log(Object.keys(PermissionFlagsBits)[parseInt(PermissionFlagsBits.KickMembers) - 1])

    let commandPing = Math.abs(Date.now() - interaction.createdTimestamp);
    let websocketPing = Math.abs(interaction.client.ws.ping);
    let replyString = `Pong!\n- Websocket ping is ${websocketPing}ms.\n- Command ping is ${commandPing}ms.`;

    return sendMessage({ interaction: interaction, content: replyString });
};

export const commandObject = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings bot.");