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

        let currentRomName = "PokemonBlue.gb"; // Rom name
        let absoluteRomPath = path.resolve(`./assets/roms/${currentRomName}`);
        let absoluteScreenPath = path.resolve(`./assets/images/roms/screenshot.jpg`);
        let rom = fs.readFileSync(absoluteRomPath); // Read rom

        let adminBool = await isAdmin(client, message.member);
        if (message.guild.id !== client.config.botServerID || !adminBool) return;

        // Emulator channel
        let emuChannelID = "919360126450819102";
        // if (message.channel.id !== emuChannelID) return;

        sendMessage(client, message, `Starting emulator...`);
        gameboy.loadRom(rom);

        setTimeout(async function () {
            // Whatever custom logic you need
            let memory = gameboy.getMemory();
            if (memory[3000] === 0) {
                gameboy.pressKeys([Gameboy.KEYMAP.RIGHT]);
            };
            setInterval(async function () {
                gameboy.doFrame();
            }, 1000 / 60); // 60 FPS
            gameboy.doFrame();
            gameboy.pressKey(Gameboy.KEYMAP.A);

            setInterval(async function () {
                await sendScreenshot(gameboy, absoluteScreenPath);
            }, 5000);
        }, 0);

        async function sendScreenshot(gameboy, absoluteScreenPath) {
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