exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        var fs = require('fs');
        var GameBoyAdvance = require('gbajs');

        var gba = new GameBoyAdvance();

        gba.logLevel = gba.LOG_ERROR;

        var biosBuf = fs.readFileSync('./node_modules/gbajs/resources/bios.bin');
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

        var idx = 0;
        setInterval(function () {
            var keypad = gba.keypad;
            keypad.press(keypad.A);

            setTimeout(function () {
                var png = gba.screenshot();
                png.pack().pipe(fs.createWriteStream('gba' + idx + '.png'));
            }, 200);
        }, 2000);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "gba",
    description: `Discord Plays GB(A).`
};