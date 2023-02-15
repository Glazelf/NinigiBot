exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { Configuration, OpenAIApi } = require("openai");

        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        // Remove this when i figure out billing
        return sendMessage({ client: client, interaction: interaction, content: `This command is currently unavailable since you guys used up the free trial credit for OpenAI. We are currently [looking into the options](<https://github.com/Glazelf/NinigiBot/issues/490>) and [OpenAI pricing plans](<https://openai.com/api/pricing/>).\nI am currently making absolutely no money with this bot, but I am paying for quite a few services including hosting. A pay-as-you-go AI plan would rack up quite a cost with ${client.user.username} being in ${client.guilds.cache.size} servers.\nConsider donating at [Paypal](<https://www.paypal.com/paypalme/glazelf>) or even [Github](<https://github.com/sponsors/Glazelf>).\nIt would mean a bunch to me and enable stupid stuff like this.\nThanks, it means a lot you're even using this bot, but money goes a long way too!` });

        const configuration = new Configuration({
            apiKey: client.config.openai,
        });
        const openai = new OpenAIApi(configuration);
        // Documentation: https://beta.openai.com/docs/api-reference/images/create?lang=node.js
        // Examples: https://beta.openai.com/examples
        let model = "text-curie-001"; // Text generation model; https://beta.openai.com/docs/models/gpt-3
        let promptInput = interaction.options.getString("prompt");
        let maxTokens = interaction.options.getInteger("max-length");
        if (!maxTokens) maxTokens = 1024; // Range 1-4096, default: 16
        let samplingTemperature = interaction.options.getNumber("temperature");
        if (!samplingTemperature) samplingTemperature = 1; // Range 0.0-2.0, default: 1.0
        let presencePenalty = interaction.options.getNumber("presence-penalty");
        if (!presencePenalty) presencePenalty = 0.0; // Range -2.0 to 2.0, default: 0.0
        let frequencyPenalty = interaction.options.getNumber("frequency-penalty");
        if (!frequencyPenalty) frequencyPenalty = 0.0; // Range -2.0 to 2.0, default: 0.0
        let imageCount = 1; // Range 1-10, default: 1
        let imageSize = "1024x1024"; // Options are 256x256, 512x512 and 1024x1024, default: 1024x1024
        let stopChars = "\n"; // Example stop character, unused

        let response = null;
        let openaiEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setFooter({ text: promptInput });
        switch (interaction.options.getSubcommand()) {
            case "image":
                try {
                    response = await openai.createImage({
                        prompt: promptInput,
                        n: imageCount,
                        size: imageSize
                    });
                } catch (e) {
                    return errorHandler(e);
                };
                openaiEmbed.setImage(response.data.data[0].url);
                break;
            case "text":
                try {
                    response = await openai.createCompletion({
                        model: model,
                        prompt: promptInput,
                        max_tokens: maxTokens,
                        temperature: samplingTemperature,
                        presence_penalty: presencePenalty,
                        frequency_penalty: frequencyPenalty,
                    });
                } catch (e) {
                    return errorHandler(e);
                };
                openaiEmbed.setDescription(response.data.choices[0].text);
                break;
        };
        return sendMessage({ client: client, interaction: interaction, embeds: openaiEmbed });

        function errorHandler(e) {
            let errorResponse = "OpenAI error: Unknown error";
            // Testing unknown error types
            if (!e.response) console.log(e);
            if (!e.response.data) console.log(e.response);
            if (!e.response.data.message) console.log(e.response.data);

            if (e.response.data.error) {
                errorResponse = errorResponse.replace("Unknown error", e.response.data.error.message);
                if (errorResponse.includes("Rate limit reached")) errorResponse = `${errorResponse.split("Rate")[0]}Rate limit reached. Please try again in a few minutes.`;
            };
            return sendMessage({ client: client, interaction: interaction, content: errorResponse });
        }

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "openai",
    description: "Use the OpenAI.",
    options: [{
        name: "text",
        type: "SUB_COMMAND",
        description: "Generate text.",
        options: [{
            name: "prompt",
            type: "STRING",
            description: "Prompt to get a response to.",
            maxLength: 512,
            required: true
        }, {
            name: "max-length",
            type: "INTEGER",
            description: "Maximum length of the response in tokens.",
            minValue: 1,
            maxValue: 1536
        }, {
            name: "temperature",
            type: "NUMBER",
            description: "Higher value makes it more creative, less factual.",
            minValue: 0.0,
            maxValue: 2.0
        }, {
            name: "presence-penalty",
            type: "NUMBER",
            description: "Higher value avoid topic repetition at the cost of quality.",
            minValue: -2.0,
            maxValue: 2.0
        }, {
            name: "frequency-penalty",
            type: "NUMBER",
            description: "Higher value avoid proportional repetition at the cost of quality.",
            minValue: -2.0,
            maxValue: 2.0
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "image",
        type: "SUB_COMMAND",
        description: "Generate an image.",
        options: [{
            name: "prompt",
            type: "STRING",
            description: "Prompt to get a response to.",
            maxLength: 1000,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};