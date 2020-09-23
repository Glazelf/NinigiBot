const pokemon = require('../objects/gifs/pokemon.json');
const reactions = require('../objects/gifs/reactions.json');
const others = require('../objects/gifs/others.json');

Array.prototype.pick = function () {
    return this[Math.floor(Math.random() * this.length)];
};

module.exports = {
    search: gifArgument => {
        const candidates = pokemon[gifArgument] || reactions[gifArgument] || others[gifArgument];
        if (candidates) return candidates.pick();
    }
};

