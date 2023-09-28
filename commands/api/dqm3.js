exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const axios = require("axios");
        const getWikiURL = require('../../util/getWikiURL');
        const parseDate = require('../../util/parseDate');
        const capitalizeString = require('../../util/capitalizeString');

        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;


    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "dqm3",
    description: `Shows Dragon Quest Monsters 3: The Dark Prince data.`,
    options: [{
        name: "monster",
        type: "SUB_COMMAND",
        description: "Get info on a monster.",
        options: [{
            name: "monster",
            type: "STRING",
            description: "Specify monster by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "tralent",
        type: "SUB_COMMAND",
        description: "Get info on a talent",
        options: [{
            name: "talent",
            type: "STRING",
            description: "Specify talent by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "trait",
        type: "SUB_COMMAND",
        description: "Get info on a trait.",
        options: [{
            name: "trait",
            type: "STRING",
            description: "Specify trait by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "ability",
        type: "SUB_COMMAND",
        description: "Get info on an ability.",
        options: [{
            name: "ability",
            type: "STRING",
            description: "Specify ability by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "trait",
        type: "SUB_COMMAND",
        description: "Get info on a trait.",
        options: [{
            name: "trait",
            type: "STRING",
            description: "Specify trait by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "item",
        type: "SUB_COMMAND",
        description: "Get info on an item.",
        options: [{
            name: "item",
            type: "STRING",
            description: "Specify item by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "spawn",
        type: "SUB_COMMAND",
        description: "Get spawns in an area.",
        options: [{
            name: "area",
            type: "STRING",
            description: "Specify area by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "synthesize",
        type: "SUB_COMMAND",
        description: "Calculate synthesis.",
        options: [{
            name: "parent1",
            type: "STRING",
            description: "Specify parent by name.",
            autocomplete: true
        }, {
            name: "parent2",
            type: "STRING",
            description: "Specify parent by name.",
            autocomplete: true
        }, {
            name: "target",
            type: "STRING",
            description: "Specify target by name.",
            autocomplete: true
        }, {
            name: "talent1",
            type: "STRING",
            description: "Specify talent by name.",
            autocomplete: true
        }, {
            name: "talent2",
            type: "STRING",
            description: "Specify talent by name.",
            autocomplete: true
        }, {
            name: "talent3",
            type: "STRING",
            description: "Specify talent by name.",
            autocomplete: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};