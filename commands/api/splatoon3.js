exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getClothes = require('../../util/splat3/getClothes');
        // Language JSON
        const chineseJSON = require("../../submodules/leanny.github.io/splat3/data/language/CNzh.json");
        const EUGermanJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUde.json");
        const EUEnglishJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUen.json");
        const EUSpanishJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUes.json");
        const EUFrenchJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUfr.json");
        const EUItalianJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUit.json");
        const EUDutchJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUnl.json");
        const EURussianJSON = require("../../submodules/leanny.github.io/splat3/data/language/EUru.json");
        const japaneseJSON = require("../../submodules/leanny.github.io/splat3/data/language/JPja.json");
        const koreanJSON = require("../../submodules/leanny.github.io/splat3/data/language/KRko.json");
        const taiwaneseJSON = require("../../submodules/leanny.github.io/splat3/data/language/TWzh.json");
        const USEnglishJSON = require("../../submodules/leanny.github.io/splat3/data/language/USen.json");
        const USSpanishJSON = require("../../submodules/leanny.github.io/splat3/data/language/USes.json");
        const USFrenchJSON = require("../../submodules/leanny.github.io/splat3/data/language/USfr.json");
        // Game data
        const GearInfoClothesJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/GearInfoClothes.json");
        const GearInfoHeadJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/GearInfoHead.json");
        const GearInfoShoesJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/GearInfoShoes.json");
        const WeaponInfoMainJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/WeaponInfoMain.json");
        const WeaponInfoSpecialJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/WeaponInfoSpecial.json");
        const WeaponInfoSubJSON = require("../../submodules/leanny.github.io/splat3/data/mush/099/WeaponInfoSub.json");

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });
        // Add language arg?
        let languageJSON = EUEnglishJSON;

        switch (interaction.options.getSubcommand()) {
            case "clothing":
                const clothesIDs = getClothes(languageJSON);

                break;
            case "weapon":
                break;
        };

        return sendMessage({ client: client, interaction: interaction, content: `test` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "splatoon3",
    description: `Shows Splatoon 3 data.`,
    options: [{
        name: "clothing",
        type: "SUB_COMMAND",
        description: "Get info on clothing.",
        options: [{
            name: "clothing",
            type: "STRING",
            description: "Specify a piece of clothing by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "weapon",
        type: "SUB_COMMAND",
        description: "Get info on a weapon..",
        options: [{
            name: "weapon",
            type: "STRING",
            description: "Specify a weapon by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};