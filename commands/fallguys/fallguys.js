module.exports.run = async (client, message) => {
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");
        const fallguys = require("fallguys-api");

        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I don't have permissions to embed messages, ${message.author}.`);
        let daily = await fallguys.getDaily();
        let pcDaily = daily.pcStore;
        // let ps4Daily = daily.ps4Store;
        let dailyStore;

        const args = message.content.split(' ');
        if (!args[1]) return message.channel.send(`You need to provide a subcommand, ${message.author}`);
        let arg1 = args[1].toLowerCase();
        let arg2 = "";
        if (args[2]) {
            if (!isNaN(args[2])) {
                arg2 = args[2] - 1;
            } else {
                arg2 = args[2].toLowerCase();
            };
        };

        if (arg1 == "store") {
            dailyStore = pcDaily;
            if (dailyStore[arg2]) {
                const dailyEmbed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor(`${dailyStore[arg2].name}`, fallguys.crownIcon)
                    .addField("Rarity:", dailyStore[arg2].rarity, false)
                    .addField("Price:", `${dailyStore[arg2].price} ${dailyStore[arg2].currency}`, false)
                    // Why is this link returning 404 lmfao
                    // .setImage(dailyStore[arg2].icon)
                    .setFooter(`Requested by ${message.author.tag}`)
                    .setTimestamp();

                return message.channel.send(dailyEmbed);

            } else {
                const dailyEmbed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor("PC Featured Store:", fallguys.crownIcon)
                    .addField(`${dailyStore[0].name} top`, `${dailyStore[0].rarity} item for ${dailyStore[0].price} ${dailyStore[0].currency} `, false)
                    .addField(`${dailyStore[1].name} bottom`, `${dailyStore[1].rarity} item for ${dailyStore[1].price} ${dailyStore[1].currency} `, false)
                    .addField(dailyStore[2].name, `${dailyStore[2].rarity} item for ${dailyStore[2].price} ${dailyStore[2].currency}`, false)
                    // Sadly articles aren't properly maintained, just returns 1.1 patchnotes banner
                    // .setImage(articles.articles[0].thumbnail)
                    .setFooter(`Requested by ${message.author.tag}`)
                    .setTimestamp();

                return message.channel.send(dailyEmbed);
            };
        };

        // I wish the icons wouldnt return 404
        // if (pcDaily[dailyNumber]) {
        //     const dailyEmbed = new Discord.MessageEmbed()
        //         .setColor(globalVars.embedColor)
        //         .setAuthor(pcDaily[dailyNumber].name, pcDaily[dailyNumber].icon)
        //         .setDescription(`Rarity: ${pcDaily[dailyNumber].rarity}`)
        //         .addField("Price:", `${pcDaily[dailyNumber].price} ${pcDaily[dailyNumber].currency}`, true)
        //         .setImage(pcDaily[dailyNumber].icon)
        //         .setFooter(`Requested by ${message.author.tag}`)
        //         .setTimestamp();

        //     return message.channel.send(dailyEmbed);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
