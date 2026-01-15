import {
    EmbedBuilder
} from "discord.js";
import type { ExtendedClient } from '../types/global.js';
import globalVars from "../objects/globalVars.json" with { type: "json" };

const maxEmbedLength = 6000;
const maxDescriptionLength = 2000;
const maxFieldValueLength = 1024;
const debugChannelID = "1325890140517826580"; // Replace ID with specific debug channel ID
// Zero-width character for empty field names. Though this is an undocumented feature and may break in the future, which is why I generally avoid them.
// It is usefull pretty much only here, where we want to paste one uninterrupted string for as long as possible, as close to 6000 characters as we can get.
const fieldName = "​";

export default async (client: ExtendedClient, info) => {
    if (process.env.DEBUG !== 1) return;
    // Format strings
    let description = info;
    if (info.length > maxDescriptionLength) description = info.substring(0, maxDescriptionLength);
    let debugInfoIndex = maxDescriptionLength;
    // Channel
    let debugChannel;
    try {
        debugChannel = await client.channels.fetch(debugChannelID);
        // console.log(info); // Uncomment to always log to console
    } catch (e: any) {
        // console.log(e);
        return console.log(info);
    };
    // Build embed
    let debugEmbeds = [];
    let debugEmbedsIndex = 0;
    debugEmbeds[debugEmbedsIndex] = new EmbedBuilder()
        .setColor(globalVars.embedColor as [number, number, number])
        .setDescription(description);
    // Fill fields
    while (info[debugInfoIndex]) {
        let fieldValue = info.substring(debugInfoIndex);
        if (fieldValue.length > maxFieldValueLength) fieldValue = info.substring(debugInfoIndex, debugInfoIndex + maxFieldValueLength);
        let futureEmbedLength = debugEmbeds[debugEmbedsIndex].length + fieldName.length + fieldValue.length;
        if (futureEmbedLength > maxEmbedLength) {
            debugEmbedsIndex++;
            debugEmbeds[debugEmbedsIndex] = new EmbedBuilder()
                .setColor(globalVars.embedColor as [number, number, number]);
        };
        debugEmbeds[debugEmbedsIndex].addFields([{ name: fieldName, value: fieldValue, inline: false }]);
        debugInfoIndex += maxFieldValueLength;
    };
    // Send embed
    return debugChannel.send({ embeds: [debugEmbeds] });
};