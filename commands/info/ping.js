import { SlashCommandBuilder } from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";

export default async (interaction) => {
    try {
        let commandPing = Math.abs(Date.now() - interaction.createdTimestamp);
        let websocketPing = Math.abs(interaction.clientws.ping);
        let replyString = `Pong!\n- Websocket ping is ${websocketPing}ms.\n- Command ping is ${commandPing}ms.`;

        return sendMessage({ client: interaction.client, interaction: interaction, content: replyString });

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

export const commandObject = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings bot.");