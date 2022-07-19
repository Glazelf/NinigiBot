
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const api_user = require('../../database/dbServices/trainer.api');

        let ephemeral = false;
        let embed,avatar;
        await interaction.deferReply({ ephemeral: ephemeral });

        let master = interaction.user

        let user, trophies;
        switch (interaction.options.getSubcommand()) {
            case "card":
                user = await api_user.getUser(master.id);
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setThumbnail(avatar)
                .addFields(
                    { name: "Money:", value: user.money.toString(), inline: true},
                    { name: "Food:", value: user.food.toString(), inline: true},
                )  
                trophies = await user.getShopTrophies();
                trophy_string = '';
                trophies.forEach(trophy=>{
                    trophy_string += ':'+trophy.icon+': ';
                })
                trophies = await user.getShinxTrophies();
                trophies.forEach(trophy=>{
                    trophy_string += ':'+trophy.icon+': ';
                })
                if (trophy_string.length > 0) {
                    embed.addFields(
                        { name: "Trophies:", value: trophy_string},
                    )
                }
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    ephemeral: ephemeral });
            

        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
module.exports.config = {
    name: "trainer",
    description: "Check your trainer stats.",
    options: [{
        name: "card",
        type: "SUB_COMMAND",
        description: "Check your trainer card!",
    },]
};