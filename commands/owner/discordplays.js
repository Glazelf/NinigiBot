exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        const fs = require('fs');
        const GameBoyAdvance = require('gbajs');

        let gba = new GameBoyAdvance();

        gba.logLevel = gba.LOG_ERROR;

        let biosBuf = fs.readFileSync('./node_modules/gbajs/resources/bios.bin');
        gba.setBios(biosBuf);
        gba.setCanvasMemory();

        gba.loadRomFromFile('/path/to/game.gba', function (err, result) {
            if (err) {
                console.error('loadRom failed:', err);
                process.exit(1);
            }
            gba.loadSavedataFromFile('/path/to/game.sav');
            gba.runStable();
        });

        let idx = 0;
        setInterval(function () {
            let keypad = gba.keypad;
            keypad.press(keypad.A);

            setTimeout(function () {
                let png = gba.screenshot();
                png.pack().pipe(fs.createWriteStream('gba' + idx + '.png'));
            }, 200);
        }, 2000);

        function sendScreenshot(screenshot) {
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
            return sendMessage({ content: `${currentRomName} screenshot:`, files: [buffer] });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "discordplays",
    description: `Discord Plays stuff.`,
    serverID: ["759344085420605471"],
};