
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { nwu_db } = require('../../nwu/database/dbServices');
        const Discord = require("discord.js");

        let ephemeral = true;
        let shinx, embed,foodArg,res,avatar;
        await interaction.deferReply({ ephemeral: ephemeral });

        let master = interaction.user
        switch (interaction.options.getSubcommand()) {
            case "data":
                let user = await nwu_db.services.getUser(master.id);
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: client.user.username })
                .setThumbnail(avatar)
                .addFields(
                    { name: "Money:", value: user.money.toString(), inline: true},
                    { name: "Food:", value: user.food.toString(), inline: true},
                )  
                let trophies = user.getTrophies();
                trophy_string = '';
                trophies.forEach(trophy=>{
                    trophy_string += ':'+icon+': '+trophy.trophy_id+'\n';
                })
                if (trophy_string.size() > 0) {
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
        description: "!",
    },]
};