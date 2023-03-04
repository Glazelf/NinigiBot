exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const fs = require('fs');
        const path = require('path');
        const Gameboy = require('serverboy');
        const Canvas = require('canvas');
        const PNG = require('pngjs').PNG;
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let frameInterval;
        let screenshotInterval;
        let savingInterval;
        let FPS = 60; // Amount of frames to advance per second
        let currentRomName = "PokemonBlue"; // Rom file name
        let romType = ".gb"; // Rom file extension. Supported: .gb & .gbc
        let absoluteRomPath = path.resolve(`./assets/roms/${currentRomName}${romType}`);
        let absoluteSavePath = absoluteRomPath.replace(romType, ".sav");

        switch (interaction.options.getSubcommand()) {
            case "start": // Start instance and set intervals
                if (!isOwner) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });
                if (client.gameboy) return sendMessage({ client: client, interaction: interaction, content: `A gameboy is already running.` });
                // Init global variables
                client.gameboy = new Gameboy(); // Global instance of emulator
                client.gameboyInput = true; // Whether or not an input has been made since last screenshot.
                // Read rom
                let rom = null;
                try {
                    rom = fs.readFileSync(absoluteRomPath);
                } catch (e) {
                    // console.log(e);
                    return sendMessage({ client: client, interaction: interaction, content: `No rom could be found!` });
                };
                // Read save
                let save = null;
                try {
                    save = fs.readFileSync(absoluteSavePath);
                } catch (e) {
                    // console.log(e);
                };
                // Loading rom
                await sendMessage({ client: client, interaction: interaction, content: `Starting emulator...` });
                client.gameboy.loadRom(rom, save);
                // Advance frame
                frameInterval = setInterval(async function () {
                    client.gameboy.doFrame();
                }, 1000 / FPS); // FPS
                // Sending screenshot
                screenshotInterval = setInterval(function () {
                    if (client.gameboyInput) sendScreenshot(client.gameboy);
                    client.gameboyInput = false;
                }, 10000); // 10 seconds, but only if an input has been made (WIP)
                // Auto-saving
                savingInterval = setInterval(function () {
                    saveGame(absoluteSavePath);
                }, 900000) // 15 minutes
                break;
            case "save": // Manual saving
                saveGame(absoluteSavePath);
                break;
            case "stop": // Kill instance
                if (interaction.user.id !== globalVars.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });
                clearInterval(frameInterval);
                clearInterval(screenshotInterval);
                clearInterval(savingInterval);
                saveGame(absoluteSavePath); // Save before quitting
                client.gameboy = null; // Null instance
                break;
            case "input": // Controller inputs
                if (interaction.channel != emuChannel) return;
                if (!client.gameboy) return sendMessage({ client: client, interaction: interaction, content: `No gameboy is currently running.` });
                // Check possible inputs
                let keymapOptions = ["RIGHT", "LEFT", "UP", "DOWN", "A", "B", "SELECT", "START"];
                let input = interaction.options.getString("button").toUpperCase();
                if (!keymapOptions.includes(input)) return sendMessage({ client: client, interaction: interaction, content: `Please provide a possible button to input.\nOptions: ${keymapOptions}` });
                client.gameboyInput = true;
                // Try to input
                try {
                    await client.gameboy.pressKey(Gameboy.KEYMAP[input]);
                    return sendMessage({ client: client, interaction: interaction, content: `Inputted ${input}.` });
                } catch (e) {
                    console.log(e);
                };
                break;
        };
        return;

        function sendScreenshot() {
            let screen = client.gameboy.getScreen();
            let gameboyWidth = 160;
            let gameboyHeight = 144;
            let canvas = Canvas.createCanvas(gameboyWidth, gameboyHeight);
            let ctx = canvas.getContext('2d');
            let data = ctx.createImageData(gameboyWidth, gameboyHeight);
            for (let i = 0; i < screen.length; i++) {
                data[i] = screen[i];
            };
            ctx.putImageData(data, 0, 0);
            //write to PNG (using pngjs)
            let png = new PNG({ width: gameboyWidth, height: gameboyHeight });
            for (let i = 0; i < screen.length; i++) {
                png.data[i] = screen[i];
            };
            let buffer = PNG.sync.write(png);
            return emuChannel.send({ content: `${currentRomName} screenshot:`, files: [buffer] });
        };

        function saveGame(absoluteSavePath) {
            let saveData = client.gameboy.getSaveData();
            let saveBuffer = Buffer.from(saveData);
            fs.writeFileSync(absoluteSavePath, saveBuffer);
            emuChannel.send({ content: "Saving game data." });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

let GBButtons = [{}];

module.exports.config = {
    name: "discordplays",
    description: `Discord Plays stuff.`,
    serverID: ["759344085420605471"],
    options: [{
        name: "input",
        type: "SUB_COMMAND",
        description: "Input a button.",
        options: [{
            name: "button",
            type: "STRING",
            description: "Button to press.",
            required: true
        }]
    }, {
        name: "save",
        type: "SUB_COMMAND",
        description: "Save game data."
    }, {
        name: "start",
        type: "SUB_COMMAND",
        description: "Start in this channel."
    }, {
        name: "stop",
        type: "SUB_COMMAND",
        description: "Stop emulator."
    }]
};