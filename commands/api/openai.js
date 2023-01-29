exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { Configuration, OpenAIApi } = require("openai");

        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        await interaction.deferReply({ ephemeral: ephemeral });

        const configuration = new Configuration({
            apiKey: client.config.openai,
        });
        const openai = new OpenAIApi(configuration);
        // Documentation: https://beta.openai.com/docs/api-reference/images/create?lang=node.js
        // Examples: https://beta.openai.com/examples
        let model = "text-davinci-003"; // Text generation model; https://beta.openai.com/docs/models/gpt-3
        // model = "code-davinci-002"; // Code generation model
        let promptInput = interaction.options.getString("prompt");
        let imageCount = 1; // Range 1-10
        let imageSize = "1024x1024"; // Options are 256x256, 512x512 and 1024x1024
        let maxTokens = 16; // Range 1-4096
        let samplingTemperature = 1.0; // Range 0.0-1.0
        let presencePenalty = 0.0; // Range -2 to 2
        let frequencyPenalty = 0.0; // Range -2 to 2
        let stopChars = "\n"; // Example stop character, unused

        let errorResponse = "OpenAI error: Unknown error";
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
                    // Testing unknown error types
                    console.log(e);
                    console.log(e.response);
                    console.log(e.response.data);

                    if (e.response.data.error) {
                        errorResponse = errorResponse.replace("Unknown error", e.response.data.error.message);
                        if (errorResponse.includes("Rate limit reached")) errorResponse = `${errorResponse.split("Rate")[0]}Rate limit reached. Please try again later.`;
                    };
                    return sendMessage({ client: client, interaction: interaction, content: errorResponse });
                };
                openaiEmbed.setImage(response.data.data[0].url);
                break;
            case "text":
                maxTokens = 2048;
                samplingTemperature = 0.1;
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
                    // Testing unknown error types
                    console.log(e);
                    console.log(e.response);
                    console.log(e.response.data);

                    // Combine error message checking with image generation sometime i guess im lazy rn though
                    if (e.response.data.error) {
                        errorResponse = errorResponse.replace("Unknown error", e.response.data.error.message);
                        if (errorResponse.includes("Rate limit reached")) errorResponse = `${errorResponse.split("Rate")[0]}Rate limit reached. Please try again later.`;
                    };
                    return sendMessage({ client: client, interaction: interaction, content: errorResponse });
                };
                openaiEmbed.setDescription(response.data.choices[0].text);
                break;
        };
        return sendMessage({ client: client, interaction: interaction, embeds: openaiEmbed });

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
            maxLength: 2048,
            required: true
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