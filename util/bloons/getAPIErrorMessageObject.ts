import {
    EmbedBuilder,
    codeBlock,
    hyperlink
} from "discord.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const btd6oakHelp = "https://support.ninjakiwi.com/hc/en-us/articles/13438499873937-Open-Data-API";

export default (error: any) => {
    console.log(error)
    let errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setColor(globalVars.embedColorError as [number, number, number])
        .setDescription(`The following error occurred while getting data from the API:${codeBlock("fix", error)}Read more on the Ninja Kiwi API and Open Access Keys (OAKs) ${hyperlink("here", btd6oakHelp)}.`);
    return { embeds: [errorEmbed] };
};