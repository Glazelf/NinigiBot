
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
                let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                let embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: client.user.username })
                .setThumbnail(avatar)
                .addField("Nickname:", shinx.nickname.toString(), false)
                .addField("Fullness:", shinx.fullness.toString(), true)
                .addField("Happiness:", shinx.happiness.toString(), true)       
                .addField("Experience:", shinx.experience.toString(), true)       
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: embed,  
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