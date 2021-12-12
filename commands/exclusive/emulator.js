exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const isAdmin = require('../../util/isAdmin');

        const fs = require('fs');
        const path = require('path');
        const Canvas = require('canvas');
        const PNG = require('pngjs').PNG;
        const Gameboy = require('serverboy');
        const gameboy = new Gameboy();

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

        let adminBool = await isAdmin(client, message.member);
        if (message.guild.id !== client.config.botServerID || !adminBool) return;

        // Emulator channel
        let emuChannelID = "919360126450819102";
        // if (message.channel.id !== emuChannelID) return;

        // Loading rom
        sendMessage(client, message, `Starting emulator...`);

        gameboy.loadRom(rom, save);

        // Logic examples
        let memory = gameboy.getMemory();
        if (memory[3000] === 0) {
            gameboy.pressKeys([Gameboy.KEYMAP.RIGHT]);
        };
        gameboy.pressKey(Gameboy.KEYMAP.A);

        // Advance frame
        setInterval(function () {
            gameboy.doFrame();
        }, 1000 / 60); // 60 FPS

        // Sending screenshot
        setInterval(function () {
            sendScreenshot(gameboy);
        }, 60000); // 1 minute, but only if an input has been made (WIP)

        // Saving
        setInterval(function () {
            let saveData = gameboy.getSaveData();
            let saveBuffer = Buffer.from(saveData);
            fs.writeFileSync(absoluteSavePath, saveBuffer);
            sendMessage(client, message, `Saving game data.`);
        }, 900000) // 15 minutes

        function sendScreenshot(gameboy) {
            let screen = gameboy.getScreen();
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

            sendMessage(client, message, "test", null, buffer);
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