const pokemon = require('./pokemon.json');
const reactions = require('./reactions.json');
const others = require('./others.json');

Array.prototype.pick = function () {
    return this[Math.floor(Math.random() * this.length)];
};

module.exports = {
    search: gifArgument => {
        const candidates = pokemon[gifArgument] || reactions[gifArgument] || others[gifArgument]
        if (candidates) return candidates.pick();
    }
};

