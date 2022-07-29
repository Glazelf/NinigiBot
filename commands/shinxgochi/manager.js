const Canvas = require('canvas');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    const checker = require('../../util/string/checkFormat');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        const api_shinx = require('../../database/dbServices/shinx.api');
        const api_user = require('../../database/dbServices/user.api');
        const api_trophy = require('../../database/dbServices/trophy.api');        
        let messageFile = null;
        let ephemeral = true;
        let embed,trophy_name,res, returnString;
        let canvas, ctx, img, shinx;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        let emotesAllowed = true;
        if (ephemeralArg === false) ephemeral = false;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;

        let master = interaction.user

        let  trophies;
        switch (interaction.options.getSubcommand()) {
            case "addshoptrophy":
                let error = '';
                trophy_name = interaction.options.getString("name").trim();
                switch(checker(trophy_name, 25)){
                    case "TooShort": 
                        error += 'Name too short\n'
                    case "TooLong":
                        error += 'Name exceeds 25 characters\n'
                    case "InvalidChars":
                        error += 'Name has invalid characters\n'
                }
                res = await api_trophy.checkTrophyExistance(trophy_name);
                if(res==true){
                    error+= 'Name already used\n'
                };
                const trophy_desc = interaction.options.getString("description").trim();
                switch(checker(trophy_desc, 1024,false)){
                    case "TooShort": 
                        error += 'Description too short\n'
                    case "TooLong":
                        error += 'Description exceeds 25 characters\n'
                    case "InvalidChars":
                        error += 'Description has invalid characters\n'
                }
                console.log(interaction.options.getString("emote"))
                const trophy_emote = interaction.options.getString("emote").trim().replace(/^:+/, '').replace(/:+$/, '');;
                console.log(trophy_emote)
                const trophy_price = interaction.options.getInteger("price");
                if(trophy_price<1){
                    error+='Price cannot be lower than 1'
                }

                if(error.length>0){
                    returnString = 'Could not add the trophy due to the following issues:```\n'+error+'\n```'
                } else {
                    await api_trophy.createShopTrophy(trophy_name, trophy_emote, trophy_desc, trophy_price);
                    returnString = `${trophy_name} added successfully to the shop!`;
                }
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: true });
            case "deleteshoptrophy":
                trophy_name = interaction.options.getString("name").trim();
                res = await api_trophy.deleteShopTrophy(trophy_name);
                returnString = res? `${trophy_name} deleted successfully from the shop!`: `${trophy_name} does not exist in the __shop__`
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: true });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
module.exports.config = {
    name: "manager",
    description: "Manage multiple aspects about the shop",
    options: [{
        name: "addshoptrophy",
        type: "SUB_COMMAND",
        description: "Add a custom trophy to the shop.",
        options: [{
            name: "name",
            type: "STRING",
            description: "Name of the trophy. Make sure it's unique with less than 25 characters!",
            required: true
        },{
            name: "emote",
            type: "STRING",
            description: "Icon of the trophy. Make sure it's a valid emote.",
            required: true
        },{
            name: "description",
            type: "STRING",
            description: "Description of the trophy",
            required: true
        },{
            name: "price",
            type: "INTEGER",
            description: "Amount of money to charge for it",
            required: true,
        },]
        },
        {
        name: "deleteshoptrophy",
        type: "SUB_COMMAND",
        description: "Delete a trophy from the shop",
        options: [{
            name: "name",
            type: "STRING",
            autocomplete: true,
            description: "Name of the trophy. Make sure it's valid!",
            required: true
        }]}
    ]
};