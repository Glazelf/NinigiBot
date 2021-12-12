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
        const { PassThrough } = require('stream');
        const stream = new PassThrough();
        const Gameboy = await import('serverboy');
        const gameboy = new Gameboy.default();

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
            gameboy.doFrame();
            gameboy.pressKey("A")

            await sendScreenshot(gameboy, absoluteScreenPath);
        }, 0);

        async function sendScreenshot(gameboy, absoluteScreenPath) {
            let screenData = gameboy.getScreen();
            let screenBuffer = Buffer.from(screenData);

            console.log({ screenData });
            console.log({ screenBuffer });

            await fs.promises.writeFile(absoluteScreenPath, screenBuffer, "binary");
            console.log(1)
            let imageCanvas = await Canvas.loadImage(screenBuffer);
            console.log(2)

            sendMessage(client, message, "test", null, imageCanvas);
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