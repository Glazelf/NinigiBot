import {
    EmbedBuilder
} from "discord.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

const maxEmbedLength = 6000;
const maxDescriptionLength = 2000;
const maxFieldValueLength = 1024;
const debugChannelID = "1325890140517826580"; // Replace ID with specific debug channel ID
const fieldName = "Field";

export default async (client, info) => {
    // return; // Comment out to enable debugging, uncomment to disable
    // Format strings
    let description = info;
    if (info.length > maxDescriptionLength) description = info.substring(0, maxDescriptionLength);
    let debugInfoIndex = maxDescriptionLength + 1;
    // Channel
    let debugChannel = client.channels.cache.get(debugChannelID);
    if (!debugChannel) debugChannel = await client.channels.fetch(debugChannelID);
    // Build embed
    let debugEmbed = new EmbedBuilder()
        .setTitle("Debug")
        .setColor(globalVars.embedColor)
        .setDescription(description);
    // Fill fields
    while (debugEmbed.length <= maxEmbedLength && info[debugInfoIndex]) {
        let fieldValue = info.substring(debugInfoIndex);
        if (fieldValue.length > maxFieldValueLength) fieldValue = info.substring(debugInfoIndex, debugInfoIndex + maxFieldValueLength);
        let substringRequiredToFit = debugEmbed.length + fieldName.length + fieldValue.length - maxEmbedLength;
        if (substringRequiredToFit > 0) fieldValue = fieldValue.substring(0, fieldValue.length - substringRequiredToFit);
        debugEmbed.addFields([{ name: fieldName, value: fieldValue, inline: false }]);
    };
    // Send embed
    return debugChannel.send({ embeds: [debugEmbed] });
};