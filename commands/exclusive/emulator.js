exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');

        const fs = require('fs');
        const path = require('path');
        const Gameboy = await import('serverboy');
        const gameboy = new Gameboy.default();

        let currentRomName = "PokemonCrystal.gbc"; // Rom name
        let absoluteRomPath = path.resolve(`./assets/roms/${currentRomName}`);
        let rom = fs.readFileSync(absoluteRomPath); // Read Rom

        let adminBool = await isAdmin(client, message.member);
        if (message.guild.id !== client.config.botServerID || !adminBool) return;

        // Emulator channel
        // if (message.channel.id !== "919360126450819102") return;

        console.log(Gameboy)
        console.log(rom)

        return sendMessage(client, message, "test");

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