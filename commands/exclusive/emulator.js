exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);

        if (message.guild.id != client.config.botServerID) return;

        const fs = require('fs');
        const path = require('path');
        const Gameboy = require('serverboy');
        const Canvas = require('canvas');
        const PNG = require('pngjs').PNG;

        // Initiate interval variables
        let frameInterval;
        let screenshotInterval;
        let savingInterval;

        let FPS = 60; // Amount of frames to advance per second
        let currentRomName = "PokemonBlue"; // Rom file name
        let romType = ".gb"; // Rom file extension. Supported: .gb & .gbc
        let absoluteRomPath = path.resolve(`./assets/roms/${currentRomName}${romType}`);
        let absoluteSavePath = absoluteRomPath.replace(romType, ".sav");

        // Emulator channel
        let emuChannelID = "919360126450819102";
        await message.guild.channels.fetch();
        let emuChannel = await message.guild.channels.cache.get(emuChannelID);

        if (!args[0]) return sendMessage(client, message, `This command requires a subcommand.`);
        let subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "boot": // Start instance and set intervals
                if (message.author.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);
                if (client.gameboy) return sendMessage(client, message, `A gameboy is already running.`);

                // Init global variables
                client.gameboy = new Gameboy(); // Global instance of emulator
                client.gameboyInput = true; // Whether or not an input has been made since last screenshot.

                // Read rom
                let rom = null;
                try {
                    rom = fs.readFileSync(absoluteRomPath);
                } catch (e) {
                    // console.log(e);
                    return sendMessage(client, message, `No rom could be found!`);
                };
                // Read save
                let save = null;
                try {
                    save = fs.readFileSync(absoluteSavePath);
                } catch (e) {
                    // console.log(e);
                };

                // Loading rom
                sendMessage(client, message, `Starting emulator...`);
                client.gameboy.loadRom(rom, save);

                // Advance frame
                frameInterval = setInterval(function () {
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
            case "kill": // Kill instance
                if (message.author.id !== globalVars.ownerID) return sendMessage(client, message, globalVars.lackPerms);
                clearInterval(frameInterval);
                clearInterval(screenshotInterval);
                clearInterval(savingInterval);
                saveGame(absoluteSavePath); // Save before quitting
                client.gameboy = null; // Null instance
                break;
            default: // Controller inputs
                if (message.channel != emuChannel) return;
                if (!client.gameboy) return sendMessage(client, message, `No gameboy is currently running.`);

                // Check possible inputs
                let keymapOptions = ["RIGHT", "LEFT", "UP", "DOWN", "A", "B", "SELECT", "START"];
                let input = args[0].toUpperCase();
                if (!keymapOptions.includes(input)) return sendMessage(client, message, `Please provide a possible button to input.\nOptions: ${keymapOptions}`);

                client.gameboyInput = true;
                // Try to input
                try {
                    client.gameboy.pressKeys([Gameboy.KEYMAP[input]]);
                    return message.react('✔️');
                } catch (e) {
                    console.log(e);
                };
                break;
        };

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

            emuChannel.send({ content: `${currentRomName} screenshot:`, files: [buffer] });
        };

        function saveGame(absoluteSavePath) {
            let saveData = client.gameboy.getSaveData();
            let saveBuffer = Buffer.from(saveData);
            fs.writeFileSync(absoluteSavePath, saveBuffer);
            emuChannel.send({ content: "Saving game data." });
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "emulator",
    aliases: ["emu"],
    description: "Interact with GB emulator."
};