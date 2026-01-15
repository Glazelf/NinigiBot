import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    TextChannel
} from "discord.js";
import type { ExtendedClient } from '../types/global.js';
import logger from "../util/logger.js";
import normalizeString from "../util/string/normalizeString.js";
import checkPermissions from "../util/discord/perms/checkPermissions.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };
import {
    getMoney,
    addMoney
} from "../database/dbServices/user.api.js";

const talkedRecently = new Set();

export default async (client: ExtendedClient, message) => {
    try {
        if (!message || !message.author) return;
        if (message.author.bot || message.author.system) return;

        let messageImage = null;
        if (message.attachments.size > 0) messageImage = message.attachments.first().proxyURL;
        if (message.channel.type === ChannelType.DM) {
            // Send message contents to dm channel
            let DMChannel = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
            let avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);
            let dmEmbeds = [];
            let embedURL = message.url;

            const profileButton = new ButtonBuilder()
                .setLabel("Profile")
                .setStyle(ButtonStyle.Link)
                .setURL(`discord://-/users/${message.author.id}`);
            let profileButtons = new ActionRowBuilder()
                .addComponents(profileButton);

            let attachmentsTitle = "Attachments:";
            let attachmentsString = "";
            if (message.attachments.size > 0) {
                attachmentsTitle += ` (${message.attachments.size})`;
                // Videos can't be embedded unless you're X (formerly Twitter) or YouTube, so they are sent as seperate mesages
                // if (messageImage.endsWith(".mp4")) seperateFiles = messageImage;
                message.attachments.forEach(attachment => {
                    if (attachment.proxyURL !== messageImage) {
                        let imageEmbed = new EmbedBuilder()
                            .setImage(attachment.proxyURL)
                            .setURL(embedURL);
                        dmEmbeds.push(imageEmbed);
                    };
                    let attachmentsStringAddition = `${attachment.proxyURL}\n`;
                    if ((attachmentsString.length + attachmentsStringAddition.length) < 1024) attachmentsString += attachmentsStringAddition;
                });
            };
            const dmEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor as [number, number, number])
                .setAuthor({ name: "DM" })
                .setURL(embedURL)
                .setThumbnail(avatar)
                .setImage(messageImage)
                .setTimestamp(message.createtTimestamp)
                .setFooter({ text: `Channel: ${message.channel.id} (${message.channel.type})\nMessage: ${message.id}` })
                .addFields([{ name: `Author:`, value: normalizeString(message.author.username), inline: false }]);
            if (message.content) dmEmbed.setDescription(message.content);
            if (attachmentsString.length > 0) dmEmbed.addFields([{ name: attachmentsTitle, value: attachmentsString, inline: false }]);
            dmEmbeds.unshift(dmEmbed);
            let dmLogObject = { content: message.author.id, embeds: dmEmbeds as any, components: [profileButtons] as any };
            if (DMChannel?.isTextBased()) {
                return (DMChannel as TextChannel).send(dmLogObject);
            }
        };
        if (message.channel.type !== ChannelType.GuildForum && !checkPermissions({ member: message.guild.members.me, channel: message.channel, permissions: [PermissionFlagsBits.SendMessages] })) return;
        if (!message.member) return;

        let memberRoles = 0;
        if (message.member.roles) memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone").size;
        // Add currency
        if (message.content && message.member) {
            if (!talkedRecently.has(message.member.id) && memberRoles > 0) {
                const currentBalance = await getMoney(message.member.id);
                // Cap money earned from just talking to avoid leaderboard creep from people who don't interact with the bot
                // Avoid using return in case more logic needs to be added below currency addition
                if (currentBalance <= 1000) {
                    addMoney(message.member.id, 1);
                    talkedRecently.add(message.member.id);
                    setTimeout(() => {
                        if (message.member) talkedRecently.delete(message.member.id);
                    }, 60_000);
                };
            };
        };
        return;

    } catch (e: any) {
        logger({ exception: e, client: client, interaction: message });
    };
};
