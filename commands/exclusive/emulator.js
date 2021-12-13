exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);

        if (message.guild.id !== globalVars.botServerID) return;

        const fs = require('fs');
        const path = require('path');
        const Canvas = require('canvas');
        const PNG = require('pngjs').PNG;

        // Emulator channel
        let emuChannelID = "919360126450819102";

        if (!args[0]) return sendMessage(client, message, `This command requires a subcommand.`);
        let subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "start":
                if (message.author.id !== globalVars.ownerID) return sendMessage(client, message, globalVars.lackPerms);
                if (client.gameboy) return sendMessage(client, message, `A gameboy is already running.`);

                // Init global variables
                const Gameboy = require('serverboy');
                client.gameboy = new Gameboy(); // Global instance of emulator
                client.gameboyInput = false; // Whether or not an input has been made since last screenshot.

                let currentRomName = "PokemonBlue"; // Rom file name. Supported roms: .gb & .gbc
                let romType = ".gb";
                let absoluteRomPath = path.resolve(`./assets/roms/${currentRomName}${romType}`);
                let absoluteSavePath = absoluteRomPath.replace(romType, ".sav");

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

                // Logic examples
                let memory = gameboy.getMemory();
                if (memory[3000] === 0) {
                    client.gameboy.pressKeys([Gameboy.KEYMAP.RIGHT]);
                };
                client.gameboy.pressKey(Gameboy.KEYMAP.A);

                // Advance frame
                setInterval(function () {
                    client.gameboy.doFrame();
                }, 1000 / 60); // 60 FPS

                // Sending screenshot
                setInterval(function () {
                    if (client.gameboyInput) sendScreenshot(client.gameboy);
                }, 10000); // 10 seconds, but only if an input has been made (WIP)

                // Auto-saving
                setInterval(function () {
                    saveGame(absoluteSavePath);
                }, 900000) // 15 minutes
                break;
            case "kill":
                if (message.author.id !== globalVars.ownerID) return sendMessage(client, message, globalVars.lackPerms);
                saveGame(absoluteSavePath); // Save before quitting
                client.gameboy = null; // Null instance
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

            client.gameboyInput = false;
            sendMessage(client, message, "test", null, buffer);
        };

        function saveGame(absoluteSavePath) {
            let saveData = client.gameboy.getSaveData();
            let saveBuffer = Buffer.from(saveData);
            fs.writeFileSync(absoluteSavePath, saveBuffer);
            sendMessage(client, message, `Saving game data.`);
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