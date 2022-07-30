

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const userApi = require('../../database/dbServices/user.api');
        const shinxApi = require('../../database/dbServices/shinx.api');

        let ephemeral = false;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        await interaction.deferReply({ ephemeral: ephemeral });
        let embed,avatar;

        let master = interaction.user

        let user, trophies;
        switch (interaction.options.getSubcommand()) {
            case "card":
                if (ephemeralArg === false) ephemeral = false;
                user = await userApi.getUser(master.id);
                avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                trophies = await user.getShopTrophies();
                trophy_string = '';
                trophies.forEach(trophy=>{
                    trophy_string += (trophy.icon+' ');
                })
                trophies = await user.getEventTrophies();
                trophies.forEach(trophy=>{
                    trophy_string += (trophy.icon+' ');
                })
                embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setThumbnail(avatar)
                .addFields(
                    { name: "Balance:", value: user.money.toString()+' :moneybag:', inline: true},
                    { name: "Food:", value: user.food.toString()+' :poultry_leg:', inline: true},
                    
                )  
                if (trophy_string.length > 0) {
                    embed.addFields(
                        { name: "Trophy Level:", value: trophies.length.toString()+' :beginner:', inline: true},
                        { name: "Trophies:", value: trophy_string},
                    )
                }

                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    ephemeral: ephemeral });
            case "swapgender":
                if (ephemeralArg === false) ephemeral = false;
                const shinx = await shinxApi.getShinx(master.id)
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: `Your character is now ${shinx.swapAndGetTrainerGender() ? 'male' : 'female'}, ${master}!`})

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
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },{
        name: "swapgender",
        type: "SUB_COMMAND",
        description: "Swap your trainer's gender.",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }]
};