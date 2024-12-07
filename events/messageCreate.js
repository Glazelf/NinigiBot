import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} from "discord.js";
import logger from "../util/logger.js";
import normalizeString from "../util/string/normalizeString.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };
import { addMoney } from "../database/dbServices/user.api.js";


const talkedRecently = new Set();

export default async (client, message) => {
    try {
        if (!message || !message.author) return;
        if (message.author.bot || message.author.system) return;

        let messageImage = null;
        if (message.attachments.size > 0) messageImage = message.attachments.first().url;
        // Ignore commands in DMs
        if (message.channel.type == "DM" || !message.guild) {
            // Send message contents to dm channel
            let DMChannel = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
            let avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);

            const profileButton = new ButtonBuilder()
                .setLabel("Profile")
                .setStyle(ButtonStyle.Link)
                .setURL(`discord://-/users/${message.author.id}`);
            let profileButtons = new ActionRowBuilder()
                .addComponents(profileButton);

            const dmEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`DM Message`)
                .setThumbnail(avatar)
                .setImage(messageImage)
                .setTimestamp()
                .addFields([{ name: `Author:`, value: normalizeString(message.author.username), inline: false }]);
            if (message.content) dmEmbed.addFields([{ name: `Message Content:`, value: message.content, inline: false }]);
            dmEmbed
            let dmLogObject = { content: message.author.id, embeds: [dmEmbed], components: [profileButtons] };
            return DMChannel.send(dmLogObject);
        };
        if (!message.channel.type == ChannelType.GuildForum && !message.channel.permissionsFor(message.guild.members.me).has("SEND_MESSAGES")) return;
        if (!message.member) return;

        let memberRoles = 0;
        if (message.member.roles) memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone").size;
        // Add currency
        if (message.content && message.member) {
            if (!talkedRecently.has(message.member.id) && memberRoles > 0) {
                addMoney(message.member.id, 1);
                talkedRecently.add(message.member.id);
                setTimeout(() => {
                    if (message.member) talkedRecently.delete(message.member.id);
                }, 60000);
            };
        };
        return;

    } catch (e) {
        logger({ exception: e, client: client, interaction: message });
    };
};