const pokemon = require('./pokemon.json');
const reactions = require('./reactions.json');
const others = require('./others.json');

module.exports = {
    search : gifArgument =>{
        return  pokemon[gifArgument]||reactions[gifArgument]||others[gifArgument];
    }
}