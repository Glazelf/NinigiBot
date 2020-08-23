const Discord = require('discord.js');
module.exports = {
    on: false,
    bets: new Map(),
    players: [],
    shift: function() {
        this.on = !this.on;
    },
    addBet: function(bet, id, reward) {
        if(!this.bets.has(bet)) this.bets.set(bet, [[id, reward]]);
        else this.bets.set(bet, this.bets.get(bet).push([id, reward]));
    },

    spin: function(result) {
        const winners = this.bets.get(`${result}`); 
        this.bets.clear();
        this.players = [];
        return winners;
    },
    hadBet: function(id){
        return this.players.includes(id);
    },
    closeTime: function() {
        return this.bets.size === 0;
    }
};
