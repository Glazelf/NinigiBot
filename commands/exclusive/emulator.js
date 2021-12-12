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
        const { promisify } = require('util');
        const Canvas = require('canvas');
        const { PassThrough } = require('stream');
        const stream = new PassThrough();
        const Gameboy = await import('serverboy');
        const gameboy = new Gameboy.default();

        let currentRomName = "PokemonCrystal.gbc"; // Rom name
        let absoluteRomPath = path.resolve(`./assets/roms/${currentRomName}`);
        let absoluteScreenPath = path.resolve(`./assets/images/roms/screenshot.png`);
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
            gameboy.doFrame();

            await sendScreenshot(gameboy, absoluteScreenPath);
        }, 0);

        async function sendScreenshot(gameboy, absoluteScreenPath) {
            const writeFileAsync = promisify(fs.writeFile);
            let screenData = gameboy.getScreen();
            let screenBuffer = Buffer.from(screenData);
            console.log(screenBuffer);
            await writeFileAsync(absoluteScreenPath, screenBuffer, function (e) {
                if (e) logger(e, client, message);
            });
            let imageCanvas = await Canvas.loadImage(absoluteScreenPath);
            sendMessage(client, message, null, null, imageCanvas);
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