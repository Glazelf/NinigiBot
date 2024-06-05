import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";

export default async (client, interaction) => {
    try {
        let commandPing = Math.abs(Date.now() - interaction.createdTimestamp);
        let websocketPing = Math.abs(client.ws.ping);
        let replyString = `Pong!\n- Websocket ping is ${websocketPing}ms.\n- Command ping is ${commandPing}ms.`;

        return sendMessage({ client: client, interaction: interaction, content: replyString });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "ping",
    description: `Pings bot.`
};