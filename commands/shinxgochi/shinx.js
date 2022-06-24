
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { nwu_db } = require('../../nwu/database/dbServices');
        const Discord = require("discord.js");

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let master = interaction.user
        switch (interaction.options.getSubcommand()) {
            case "data":
                let shinx = await nwu_db.services.getShinx(master.id);
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                const file = new Discord.MessageAttachment('../../assets/shinx.png');

                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                let embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: client.user.username })
                .setImage('attachment://shinx.png')
                .addFields(
                    { name: "Nickname:", value: shinx.nickname.toString()},
                    { name: "Level:", value: shinx.getLevel().toString(), inline: true},
                    { name: "Experience:", value: shinx.experience.toString(), inline: true},
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: "Fullness:", value: shinx.fullness.toString(), inline: true},
                    { name: "Happiness:", value: shinx.happiness.toString(), inline: true},
                )
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    ephemeral: ephemeral });
            case "addexp":
                await nwu_db.services.addExperience(master.id);
                returnString = `Added experience to your Shinx!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral });      
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
module.exports.config = {
    name: "shinx",
    description: "Interact with your Shinx.",
    options: [{
        name: "data",
        type: "SUB_COMMAND",
        description: "See your shinx!",
    },{
        name: "addexp",
        type: "SUB_COMMAND",
        description: "Add experience!",
    }]
};